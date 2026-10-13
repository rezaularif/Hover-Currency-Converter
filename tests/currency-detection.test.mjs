import test from 'node:test';
import assert from 'node:assert/strict';

import '../lib/currency-detection.js';

const {
  collectPageCurrencies,
  findElementCurrency,
  getLocaleCurrency,
  getLocalCurrencies,
  resolveSymbolCurrency
} = globalThis.HCCCurrencyDetection;

function page({ hostname = 'www.example.com', pathname = '/', search = '', lang = '', ogLocale = null, structured = [], jsonLd = [] } = {}) {
  const doc = {
    documentElement: { getAttribute: name => (name === 'lang' ? lang : null) },
    querySelector: selector => (selector.includes('og:locale') && ogLocale
      ? { getAttribute: () => ogLocale }
      : null),
    querySelectorAll: selector => {
      if (selector.includes('ld+json')) return jsonLd.map(textContent => ({ textContent }));
      return structured.map(content => ({ getAttribute: () => content, textContent: '' }));
    }
  };
  return collectPageCurrencies(doc, { hostname, pathname, search });
}

test('locale tags map to currencies only when unambiguous', () => {
  const cases = [
    ['da-DK', 'DKK'], ['da', 'DKK'], ['en_GB', 'GBP'], ['en-CA', 'CAD'], ['sv', 'SEK'], ['nb-NO', 'NOK'],
    ['zh-Hant-TW', 'TWD'], ['zh-CN', 'CNY'], ['zh-Hant', null], ['en', null], ['sv-FI', null], ['', null], [null, null]
  ];
  for (const [tag, expected] of cases) {
    assert.equal(getLocaleCurrency(tag), expected, String(tag));
  }
});

test('page currencies are ordered from most to least reliable clue', () => {
  assert.deepEqual(page({
    hostname: 'dk.example.se',
    pathname: '/no/products',
    search: '?currency=isk',
    lang: 'en-GB',
    ogLocale: 'en_US',
    structured: ['CHF'],
    jsonLd: ['{"priceCurrency": "EUR"}', '{"priceCurrency":"EUR"}']
  }), ['EUR', 'CHF', 'ISK', 'NOK', 'DKK', 'SEK', 'GBP', 'USD']);
});

test('URL clues read locale paths, subdomains, and country domains', () => {
  assert.deepEqual(page({ pathname: '/dk/da/' }), ['DKK']);
  assert.deepEqual(page({ pathname: '/en-ca/shop' }), ['CAD']);
  assert.deepEqual(page({ pathname: '/sv/' }), ['SEK']);
  assert.deepEqual(page({ hostname: 'shop.example.co.uk' }), ['GBP']);
  assert.deepEqual(page({ hostname: 'no.example.com' }), ['NOK']);
});

test('generic domains and language-like paths are not treated as countries', () => {
  assert.deepEqual(page({ hostname: 'startup.ai' }), []);
  assert.deepEqual(page({ hostname: 'brand.co' }), []);
  assert.deepEqual(page({ hostname: 'shop.example.nu' }), []);
  assert.deepEqual(page({ pathname: '/ar/products' }), []);
  assert.deepEqual(page({ pathname: '/bn/' }), []);
});

test('html lang without a region is the weakest page clue', () => {
  assert.deepEqual(page({ hostname: 'shop.example.se', lang: 'da' }), ['SEK', 'DKK']);
  assert.deepEqual(page({ lang: 'en-US' }), ['USD']);
});

test('structured data currencies are ordered by frequency', () => {
  assert.deepEqual(page({ jsonLd: ['"priceCurrency":"USD" "priceCurrency":"DKK" "priceCurrency":"DKK"'] }), ['DKK', 'USD']);
});

test('element currency hints come from attributes and microdata scopes', () => {
  const scope = {
    getAttribute: () => null,
    hasAttribute: name => name === 'itemscope',
    querySelector: () => ({ getAttribute: () => 'nok' }),
    parentElement: null
  };
  const price = { getAttribute: () => null, hasAttribute: () => false, parentElement: scope };
  assert.equal(findElementCurrency(price), 'NOK');
  assert.equal(findElementCurrency({ getAttribute: name => (name === 'data-price-currency' ? 'DKK' : null), parentElement: null }), 'DKK');
  assert.equal(findElementCurrency(null), null);
});

test('symbol resolution follows override, element, page, default, local, fallback', () => {
  const context = {
    siteCurrency: 'NOK',
    elementCurrency: 'ISK',
    pageCurrencies: ['USD', 'SEK'],
    symbolCurrency: 'DKK',
    localCurrencies: ['DKK']
  };
  assert.equal(resolveSymbolCurrency('kr', context), 'NOK');
  assert.equal(resolveSymbolCurrency('kr', { ...context, siteCurrency: 'EUR' }), 'ISK');
  assert.equal(resolveSymbolCurrency('kr', { ...context, siteCurrency: null, elementCurrency: null }), 'SEK');
  assert.equal(resolveSymbolCurrency('kr', { symbolCurrency: 'DKK', localCurrencies: ['NOK'] }), 'DKK');
  assert.equal(resolveSymbolCurrency('kr', { localCurrencies: getLocalCurrencies('EUR', ['is-IS']) }), 'ISK');
  assert.equal(resolveSymbolCurrency('kr', {}), 'SEK');
  assert.equal(resolveSymbolCurrency('$', { localCurrencies: ['CAD'] }), 'USD');
  assert.equal(resolveSymbolCurrency('unknown', {}), null);
});