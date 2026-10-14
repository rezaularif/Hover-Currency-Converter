import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as settings from '../lib/settings.js';
import { RESULT_GRADIENT_STYLES } from '../lib/result-gradients.js';
import '../lib/currencies.js';
import '../lib/currency-detection.js';

const source = (await readFile(new URL('../sidepanel/sidepanel.js', import.meta.url), 'utf8'))
  .replace(/^import[\s\S]*?;\n/gm, '');

function createElement() {
  const classes = new Set();
  return {
    value: '', textContent: '', style: { setProperty() {} }, dataset: {}, children: [], listeners: new Map(),
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: (name, force) => (force ?? !classes.has(name)) ? classes.add(name) : classes.delete(name)
    },
    setAttribute() {}, removeAttribute() {}, closest() {}, querySelectorAll: () => [],
    addEventListener(name, fn) { this.listeners.set(name, fn); },
    appendChild(child) { this.children.push(child); },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; }
  };
}

function createFakePicker(options) {
  let value = null;
  return {
    options,
    entries: null,
    unavailable: false,
    setEntries(entries, code) { this.entries = entries; value = code; },
    setValue(code) { value = code; },
    setUnavailable() { this.unavailable = true; value = null; },
    getValue: () => value,
    choose(code) { value = code; options.onSelect(code); }
  };
}

function setup({ tabs = [], sync = {}, local = null, fetchImpl = null } = {}) {
  const pickers = {};
  const elements = new Map();
  const requests = [];
  const tabQueries = [];
  const tabListeners = {};
  const syncWrites = [];
  const syncData = { ...sync };
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, { ...createElement(), querySelector: getElement });
    return elements.get(id);
  };
  const context = vm.createContext({
    ...settings, RESULT_GRADIENT_STYLES, console, URL, Intl, Date,
    HCCCurrencies: globalThis.HCCCurrencies,
    HCCCurrencyDetection: globalThis.HCCCurrencyDetection,
    fetchJsonWithRetry: fetchImpl || (() => new Promise(() => {})),
    createCurrencyPicker: (root, options) => {
      pickers[options.compact ? 'source' : 'target'] = createFakePicker(options);
      return pickers[options.compact ? 'source' : 'target'];
    },
    document: {
      getElementById: getElement, querySelector: getElement, createElement,
      addEventListener(name, callback) { if (name === 'DOMContentLoaded') callback(); }
    },
    chrome: {
      tabs: {
        query: () => {
          if (tabs.length > 0) return Promise.resolve([tabs.shift()]);
          return new Promise(resolve => tabQueries.push(resolve));
        },
        onActivated: { addListener: fn => { tabListeners.activated = fn; } },
        onUpdated: { addListener: fn => { tabListeners.updated = fn; } }
      },
      storage: {
        local: {
          get: (defaults, callback) => {
            if (!local) return new Promise(() => {});
            const values = { ...defaults, ...local };
            if (callback) return callback(values);
            return Promise.resolve(values);
          },
          set: () => Promise.resolve()
        },
        sync: {
          get(defaults, callback) {
            const values = { ...defaults, ...syncData };
            if (callback) return callback(values);
            return Promise.resolve(values);
          },
          set(values) {
            syncWrites.push(values);
            Object.assign(syncData, values);
            return Promise.resolve();
          }
        }
      },
      runtime: {
        sendMessage: (message, callback) => new Promise((resolve, reject) => {
          requests.push({
            message,
            resolve: value => {
              if (callback) callback(value);
              resolve(value);
            },
            reject
          });
        })
      }
    }
  });
  vm.runInContext(source, context);
  if (!local) {
    pickers.source.setValue('USD');
    pickers.target.setValue('EUR');
  }
  return {
    requests, tabQueries, tabListeners, syncWrites, getElement, pickers,
    lastWrite: () => JSON.parse(JSON.stringify(syncWrites.at(-1))),
    input(value) {
      getElement('fromAmount').value = value;
      return getElement('fromAmount').listeners.get('input')();
    },
    change(id, value, target = null) {
      const element = getElement(id);
      element.value = value;
      element.listeners.get('change')(target ? { target } : undefined);
    },
    result: () => getElement('.result-amount').textContent
  };
}

const flush = () => new Promise(resolve => setImmediate(resolve));
const formatted = value => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

test('quick converter ignores out-of-order replies', async () => {
  const app = setup();
  const first = app.input('10');
  const second = app.input('20');
  app.requests[1].resolve({ success: true, converted: 18 });
  await second;
  assert.equal(app.result(), formatted(18));
  app.requests[0].resolve({ success: true, converted: 9 });
  await first;
  assert.equal(app.result(), formatted(18));
});

test('clearing an amount invalidates a pending conversion', async () => {
  const app = setup();
  const pending = app.input('10');
  await app.input('');
  app.requests[0].resolve({ success: true, converted: 9 });
  await pending;
  assert.equal(app.result(), '--');
});

test('quick converter handles messaging failures', async () => {
  const app = setup();
  const pending = app.input('10');
  app.requests[0].reject(new Error('Extension context invalidated'));
  await pending;
  assert.equal(app.result(), 'Error');
});

test('site currency overrides load and save for the active site', async () => {
  const app = setup({
    tabs: [{ url: 'https://shop.example.dk/cart' }],
    sync: { siteCurrencies: { 'example.dk': 'NOK', 'other.se': 'SEK' } }
  });
  await flush();
  assert.equal(app.getElement('siteCurrencySite').textContent, 'example.dk');
  assert.equal(app.getElement('siteCurrency').value, 'NOK');

  app.change('siteCurrency', 'DKK');
  await flush();
  assert.deepEqual(app.lastWrite(), { siteCurrencies: { 'other.se': 'SEK', 'example.dk': 'DKK' } });

  app.change('siteCurrency', '');
  await flush();
  assert.deepEqual(app.lastWrite(), { siteCurrencies: { 'other.se': 'SEK' } });
});

test('a slower lookup for a previous tab cannot replace the current site', async () => {
  const app = setup();
  app.tabListeners.activated();
  app.tabQueries[1]([{ url: 'https://new.example.no/' }]);
  await flush();
  app.tabQueries[0]([{ url: 'https://old.example.se/' }]);
  await flush();
  assert.equal(app.getElement('siteCurrencySite').textContent, 'example.no');

  app.change('siteCurrency', 'NOK');
  await flush();
  assert.deepEqual(app.lastWrite(), { siteCurrencies: { 'example.no': 'NOK' } });
});

test('shared symbol defaults render on first open and save changes', async () => {
  const app = setup({ sync: { symbolCurrencies: { $: 'CAD' } } });
  await flush();
  const list = app.getElement('symbolCurrencyList');
  assert.equal(list.children.length, 0);
  const details = app.getElement('symbolDetails');
  details.open = true;
  details.listeners.get('toggle')();
  await flush();
  assert.equal(list.children.length, Object.keys(globalThis.HCCCurrencyDetection.SYMBOL_GROUPS).length);
  assert.equal(list.children.find(row => row.children[1].dataset.symbol === '$').children[1].value, 'CAD');

  list.listeners.get('change')({ target: { dataset: { symbol: 'kr' }, value: 'DKK' } });
  await flush();
  assert.deepEqual(app.lastWrite(), { symbolCurrencies: { $: 'CAD', kr: 'DKK' } });
});
test('both currency pickers share one component with full and compact labels', () => {
  const app = setup();
  assert.equal(app.pickers.target.options.compact, undefined);
  assert.equal(app.pickers.source.options.compact, true);
  assert.equal(app.pickers.target.options.idPrefix, 'target-currency');
  assert.equal(app.pickers.source.options.idPrefix, 'source-currency');
});

test('choosing a target currency saves it and converts', async () => {
  const app = setup();
  await flush();
  app.pickers.target.choose('JPY');
  assert.equal(app.getElement('resultCurrency').textContent, 'JPY');
  assert.deepEqual(app.lastWrite(), { targetCurrency: 'JPY' });

  const pending = app.input('10');
  assert.equal(app.requests.at(-1).message.toCurrency, 'JPY');
  app.requests.at(-1).resolve({ success: true, converted: 1500 });
  await pending;
  assert.equal(app.result(), formatted(1500));
});

test('choosing a source currency saves it and converts', async () => {
  const app = setup();
  await flush();
  app.getElement('fromAmount').value = '25';
  app.pickers.source.choose('DKK');
  assert.deepEqual(app.lastWrite(), { fromCurrency: 'DKK' });
  assert.deepEqual(
    JSON.parse(JSON.stringify(app.requests.at(-1).message)),
    { type: 'convert', amount: 25, fromCurrency: 'DKK', toCurrency: 'EUR' }
  );
});

test('loaded currencies populate both pickers and swap exchanges them', async () => {
  const app = setup({
    local: {
      currenciesList: { usd: 'US Dollar', eur: 'Euro', dkk: 'Danish Krone', btc: 'Bitcoin' },
      currenciesListFetchedAt: Date.now()
    },
    sync: { targetCurrency: 'DKK', fromCurrency: 'USD' }
  });
  await flush();
  await flush();
  assert.deepEqual(JSON.parse(JSON.stringify(app.pickers.target.entries.list.map(entry => entry.code))), ['USD', 'EUR', 'DKK']);
  assert.equal(app.pickers.source.entries, app.pickers.target.entries);
  assert.equal(app.pickers.target.getValue(), 'DKK');
  assert.equal(app.pickers.source.getValue(), 'USD');
  assert.equal(app.pickers.target.entries.byCode.get('DKK').shortLabel, '🇩🇰 DKK');

  app.getElement('swapBtn').listeners.get('click')();
  assert.equal(app.pickers.target.getValue(), 'USD');
  assert.equal(app.pickers.source.getValue(), 'DKK');
  assert.deepEqual(app.lastWrite(), { targetCurrency: 'USD', fromCurrency: 'DKK' });
});

test('currency list fetch falls back to pages.dev when primary CDN fails or returns invalid data', async () => {
  for (const failure of ['throw', null, [], {}]) {
    const urls = [];
    const app = setup({
      local: { currenciesList: null, currenciesListFetchedAt: 0 },
      fetchImpl: async url => {
        urls.push(url);
        if (url.includes('jsdelivr')) {
          if (failure === 'throw') throw new Error('CDN blocked');
          return failure;
        }
        return { usd: 'US Dollar', eur: 'Euro' };
      }
    });
    await flush();
    await flush();
    assert.equal(urls.length, 2);
    assert.match(urls[1], /currency-api\.pages\.dev/);
    assert.deepEqual(JSON.parse(JSON.stringify(app.pickers.target.entries.list.map(entry => entry.code))), ['USD', 'EUR']);
  }
});

test('stale cached rates trigger a background getRates refresh on panel open and preserve age when refresh falls back to stale cache', async () => {
  const staleTime = Date.now() - 2 * 60 * 60 * 1000;
  const app = setup({
    local: {
      currenciesList: { usd: 'US Dollar', eur: 'Euro' },
      currenciesListFetchedAt: Date.now(),
      lastFetch: staleTime
    }
  });
  await flush();
  await flush();
  const rateReq = app.requests.find(r => r.message.type === 'getRates');
  assert.ok(rateReq);
  rateReq.resolve({ success: true, lastFetch: staleTime });
  assert.equal(app.getElement('.status-text').textContent, 'Rates updated 2h ago');
  assert.equal(app.getElement('.status-dot').classList.contains('success'), true);

  const freshApp = setup({
    local: {
      currenciesList: { usd: 'US Dollar', eur: 'Euro' },
      currenciesListFetchedAt: Date.now(),
      lastFetch: staleTime
    }
  });
  await flush();
  await flush();
  const freshReq = freshApp.requests.find(r => r.message.type === 'getRates');
  freshReq.resolve({ success: true, lastFetch: Date.now() });
  assert.equal(freshApp.getElement('.status-text').textContent, 'Rates updated just now');
});
