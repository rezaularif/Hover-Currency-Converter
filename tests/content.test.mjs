import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

import '../lib/currencies.js';
import '../lib/currency-detection.js';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const sources = await Promise.all(manifest.content_scripts[0].js
  .map(path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));

function setup({ hostname = 'shop.example.com', pathname = '/', lang = 'en', sync = {}, languages = [], jsonLd = [] } = {}) {
  const listeners = new Map();
  const requests = [];
  const elements = [];
  let onChanged;
  function link(parent) {
    parent.childNodes.forEach((child, index) => {
      child.parentNode = parent;
      child.nextSibling = parent.childNodes[index + 1] ?? null;
      if (child.childNodes) link(child);
    });
    parent.firstChild = parent.childNodes[0] ?? null;
  }
  function element(text = '', attributes = {}, children = null, parentElement = null) {
    const classes = new Set();
    const el = {
      textContent: text,
      childNodes: children || [{ nodeType: 3, textContent: text }],
      isConnected: true, style: {}, className: '', parentElement,
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
      getAttribute: name => attributes[name] ?? null,
      hasAttribute: name => Object.hasOwn(attributes, name),
      setAttribute() {}, appendChild() {}, contains: other => other === el,
      getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 50, width: 100, height: 50 })
    };
    link(el);
    return el;
  }
  const document = {
    readyState: 'complete', body: element(),
    documentElement: { getAttribute: name => (name === 'lang' ? lang : null) },
    querySelector: () => null,
    querySelectorAll: selector => (selector.includes('ld+json') ? jsonLd.map(textContent => ({ textContent })) : []),
    createElement() { const el = element(); elements.push(el); return el; },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: name => listeners.delete(name)
  };
  const context = vm.createContext({
    document, Node: { TEXT_NODE: 3 }, console, URLSearchParams,
    setTimeout, clearTimeout,
    innerWidth: 1000, innerHeight: 800,
    location: { hostname, pathname, search: '', href: `https://${hostname}${pathname}` },
    navigator: { languages },
    chrome: {
      storage: {
        sync: { get: async defaults => ({ ...defaults, ...sync }) },
        local: { get: async defaults => defaults },
        onChanged: { addListener: fn => { onChanged = fn; } }
      },
      runtime: {
        onMessage: { addListener() {} },
        sendMessage: message => new Promise(resolve => requests.push({ message, resolve }))
      }
    }
  });
  context.window = context;
  sources.forEach(source => vm.runInContext(source, context));
  return {
    element, requests, elements, context, listeners,
    event: (name, target, extra = {}) => listeners.get(name)?.({ target, clientX: 10, clientY: 10, ...extra }),
    change: (changes, area = 'sync') => onChanged(changes, area),
    visible: () => elements[0]?.classList.contains('visible') ?? false
  };
}

const flush = () => new Promise(resolve => setImmediate(resolve));
const success = { success: true, converted: 9 };

async function hover(options, text, attributes) {
  const app = setup(options);
  await flush();
  app.event('mouseover', app.element(text, attributes));
  return app.requests[0]?.message ?? null;
}

test('latest hover wins, including returning to the same element', async () => {
  const app = setup();
  await flush();
  const first = app.element('$10');
  const second = app.element('$20');
  app.event('mouseover', first);
  app.event('mouseover', second);
  app.event('mouseover', first);
  app.requests[0].resolve(success);
  await flush();
  assert.equal(app.visible(), false);
  app.requests[2].resolve(success);
  await flush();
  assert.equal(app.visible(), true);
  app.requests[1].resolve(success);
  await flush();
  assert.equal(app.visible(), true);
});

for (const action of ['currency', 'disable', 'escape', 'site', 'site currency', 'symbol default', 'removed', 'blur']) {
  test(`${action} invalidates an in-flight tooltip`, async () => {
    const app = setup();
    await flush();
    const target = app.element('$10');
    app.event('focusin', target);
    if (action === 'currency') app.change({ targetCurrency: { newValue: 'JPY' } });
    if (action === 'disable') app.change({ enabled: { newValue: false } });
    if (action === 'escape') app.event('keydown', target, { key: 'Escape' });
    if (action === 'site') app.change({ disabledSites: { newValue: ['example.com'] } });
    if (action === 'site currency') app.change({ siteCurrencies: { newValue: { 'example.com': 'CAD' } } });
    if (action === 'symbol default') app.change({ symbolCurrencies: { newValue: { $: 'AUD' } } });
    if (action === 'removed') target.isConnected = false;
    if (action === 'blur') {
      app.event('focusout', target);
      await new Promise(resolve => setTimeout(resolve, 120));
    }
    app.requests[0].resolve(success);
    await flush();
    assert.equal(app.visible(), false);
  });
}

test('content script can be reinjected without duplicate initialization', async () => {
  const app = setup();
  await flush();
  sources.forEach(source => vm.runInContext(source, app.context));
  await flush();
  app.event('mouseover', app.element('$10'));
  assert.equal(app.requests.length, 1);
});

test('no page DOM is added until a tooltip is shown, and tooltip elements are reused', async () => {
  const app = setup();
  await flush();
  app.event('mouseover', app.element('Just text'));
  assert.equal(app.elements.length, 0);

  app.event('mouseover', app.element('$10'));
  app.requests[0].resolve(success);
  await flush();
  assert.equal(app.visible(), true);
  const created = app.elements.length;
  assert.equal(created, 5);

  app.event('mouseover', app.element('$20'));
  app.requests[1].resolve(success);
  await flush();
  assert.equal(app.elements.length, created);
  assert.equal(app.visible(), true);
});

test('pointer tracking listeners are attached only while a conversion is active', async () => {
  const app = setup();
  await flush();
  for (const name of ['mousemove', 'mouseout', 'focusout', 'scroll']) assert.equal(app.listeners.has(name), false);
  const target = app.element('$10');
  app.event('mouseover', target);
  for (const name of ['mousemove', 'mouseout', 'focusout', 'scroll']) assert.equal(app.listeners.has(name), true);
  app.event('keydown', target, { key: 'Escape' });
  for (const name of ['mousemove', 'mouseout', 'focusout', 'scroll']) assert.equal(app.listeners.has(name), false);
});

test('scrolling hides the tooltip only when the hovered price moves', async () => {
  const app = setup();
  await flush();
  const target = app.element('$10');
  app.event('mouseover', target);
  app.listeners.get('scroll')({ target: { contains: () => true } });
  app.requests[0].resolve(success);
  await flush();
  assert.equal(app.visible(), true);
  app.listeners.get('scroll')({ target: { contains: node => node === target } });
  assert.equal(app.visible(), true);
  target.getBoundingClientRect = () => ({ left: 0, right: 100, top: -40, bottom: 10, width: 100, height: 50 });
  app.listeners.get('scroll')({ target: { contains: () => false } });
  assert.equal(app.visible(), true);
  app.listeners.get('scroll')({ target: { contains: node => node === target } });
  assert.equal(app.visible(), false);
});

test('only short ancestor text is searched for split prices', async () => {
  const app = setup();
  await flush();
  const card = app.element('Product 12 with a long description that explains the item $10 Add');
  app.event('mouseover', app.element('Add to cart', {}, null, card));
  assert.equal(app.requests.length, 0);

  const price = app.element('$ 10', {}, [{ nodeType: 3, textContent: '$ ' }, { nodeType: 3, textContent: '10' }]);
  app.event('mouseover', app.element('10', {}, null, price));
  assert.equal(app.requests[0].message.amount, 10);
});

test('Danish prices are not converted for a Danish user on a Danish site', async () => {
  assert.equal(await hover({ hostname: 'shop.example.dk', sync: { targetCurrency: 'DKK' } }, '199 kr.'), null);
  assert.equal(await hover({ hostname: 'shop.example.dk', sync: { targetCurrency: 'DKK' } }, 'kr. 1.299,00'), null);
});

test('Danish prices convert from DKK for other target currencies', async () => {
  const message = await hover({ hostname: 'shop.example.dk', sync: { targetCurrency: 'EUR' } }, '1.299,00 kr.');
  assert.equal(message.fromCurrency, 'DKK');
  assert.equal(message.amount, 1299);
});

test('kr on a site with no clues is treated as the user currency', async () => {
  assert.equal(await hover({ sync: { targetCurrency: 'DKK' } }, 'kr 249'), null);
  assert.equal((await hover({ sync: { targetCurrency: 'EUR' }, languages: ['da-DK', 'en'] }, 'kr 249')).fromCurrency, 'DKK');
  assert.equal((await hover({ sync: { targetCurrency: 'EUR' } }, 'kr 249')).fromCurrency, 'SEK');
});

test('page clues outrank the user currency and symbol defaults', async () => {
  const swedishSite = { hostname: 'shop.example.se', sync: { targetCurrency: 'DKK', symbolCurrencies: { kr: 'NOK' } } };
  assert.equal((await hover(swedishSite, '199 kr')).fromCurrency, 'SEK');

  const structured = { sync: { targetCurrency: 'EUR' }, jsonLd: ['{"offers":{"priceCurrency":"ISK"}}'] };
  assert.equal((await hover(structured, '4.990 kr.')).fromCurrency, 'ISK');

  assert.equal((await hover({ sync: { targetCurrency: 'EUR' } }, '199 kr', { 'data-currency': 'NOK' })).fromCurrency, 'NOK');
  assert.equal((await hover({ hostname: 'www.example.com', pathname: '/dk/da/', sync: { targetCurrency: 'EUR' } }, '199 kr.')).fromCurrency, 'DKK');
});

test('symbol defaults apply when the page has no clues', async () => {
  const message = await hover({ sync: { targetCurrency: 'EUR', symbolCurrencies: { kr: 'NOK' } } }, '199 kr');
  assert.equal(message.fromCurrency, 'NOK');
});

test('site overrides win over every page clue', async () => {
  const options = { hostname: 'shop.example.dk', sync: { targetCurrency: 'EUR', siteCurrencies: { 'example.dk': 'NOK' } } };
  assert.equal((await hover(options, '199 kr', { 'data-currency': 'DKK' })).fromCurrency, 'NOK');
  assert.equal((await hover(options, '$10')).fromCurrency, 'USD');
});

test('site override changes apply without reloading the page', async () => {
  const app = setup({ sync: { targetCurrency: 'DKK' } });
  await flush();
  app.event('mouseover', app.element('199 kr'));
  assert.equal(app.requests.length, 0);
  app.change({ siteCurrencies: { newValue: { 'example.com': 'SEK' } } });
  app.event('mouseover', app.element('199 kr'));
  assert.equal(app.requests[0].message.fromCurrency, 'SEK');
});

test('dollar prices use page region but do not assume the user currency', async () => {
  assert.equal((await hover({ hostname: 'shop.example.ca', sync: { targetCurrency: 'EUR' } }, '$20')).fromCurrency, 'CAD');
  assert.equal((await hover({ lang: 'en-AU', sync: { targetCurrency: 'EUR' } }, '$20')).fromCurrency, 'AUD');
  assert.equal((await hover({ sync: { targetCurrency: 'CAD' } }, '$20')).fromCurrency, 'USD');
  assert.equal((await hover({ hostname: 'startup.ai', sync: { targetCurrency: 'EUR' } }, '$20')).fromCurrency, 'USD');
});

test('yen prices on Chinese pages use CNY', async () => {
  assert.equal((await hover({ lang: 'zh-CN', sync: { targetCurrency: 'EUR' } }, '¥99')).fromCurrency, 'CNY');
  assert.equal((await hover({ sync: { targetCurrency: 'EUR' } }, '¥99')).fromCurrency, 'JPY');
  assert.equal((await hover({ sync: { targetCurrency: 'EUR' } }, 'CN¥99')).fromCurrency, 'CNY');
});

test('large containers and script text are not parsed as prices', async () => {
  const app = setup();
  await flush();
  const longText = `${'Lorem ipsum '.repeat(30)} $10`;
  const container = app.element(longText, {}, [
    { nodeType: 3, textContent: longText }
  ]);
  app.event('mouseover', container);
  const script = app.element('', {}, [
    { nodeType: 1, tagName: 'SCRIPT', childNodes: [{ nodeType: 3, textContent: '$10' }] }
  ]);
  app.event('mouseover', script);
  assert.equal(app.requests.length, 0);
});

test('every shared-symbol candidate is a supported currency', () => {
  const supported = globalThis.HCCCurrencies.SUPPORTED_CURRENCIES;
  for (const [symbol, group] of Object.entries(globalThis.HCCCurrencyDetection.SYMBOL_GROUPS)) {
    for (const code of group.candidates) {
      assert.ok(supported.has(code), `${code} for ${symbol} is missing from CURRENCY_SYMBOLS`);
    }
    assert.ok(group.candidates.includes(group.fallback), `${symbol} fallback must be a candidate`);
  }
});