import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectChangedSettings,
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  MAX_SITE_CURRENCIES,
  VALID_RESULT_GRADIENTS,
  getRootDomain,
  getSiteCurrency,
  getSiteKeys,
  normalizeDecimalPlaces,
  normalizeSiteCurrencies,
  normalizeSymbolCurrencies,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';
import { RESULT_GRADIENT_STYLES } from '../lib/result-gradients.js';

test('missing decimal preferences use the default rather than coercing to zero', () => {
  for (const value of [null, undefined, '', '  ', false, true, [], {}]) {
    assert.equal(normalizeDecimalPlaces(value), DEFAULT_LOCAL_SETTINGS.decimalPlaces);
  }
  assert.equal(normalizeDecimalPlaces(0), 0);
  assert.equal(normalizeDecimalPlaces('4'), 4);
});

test('site matching shares normalized roots and legacy keys across contexts', () => {
  const cases = [
    ['Shop.Example.com.', 'example.com', ['example.com']],
    ['shop.example.co.uk', 'example.co.uk', ['example.co.uk', 'co.uk']],
    ['shop.example.com.au', 'example.com.au', ['example.com.au', 'com.au']],
    ['localhost', 'localhost', ['localhost']],
    ['127.0.0.1', '127.0.0.1', ['127.0.0.1']],
    ['[::1]', '[::1]', ['[::1]']]
  ];
  for (const [host, root, keys] of cases) {
    assert.equal(getRootDomain(host), root);
    assert.deepEqual(getSiteKeys(host), keys);
  }
});

test('every valid result gradient has a style definition', () => {
  for (const gradient of VALID_RESULT_GRADIENTS) {
    assert.ok(RESULT_GRADIENT_STYLES[gradient], `${gradient} is missing a style definition`);
  }
});

test('collectChangedSettings returns only normalized values that changed', () => {
  assert.deepEqual(
    collectChangedSettings(
      { enabled: true, disabledSites: ['example.com'], targetCurrency: 'USD' },
      { enabled: true, disabledSites: ['example.com'], targetCurrency: 'EUR' }
    ),
    { targetCurrency: 'EUR' }
  );
});

test('resolveSyncSettings falls back to valid currency defaults and safe site list', () => {
  const resolved = resolveSyncSettings(
    {
      targetCurrency: '??',
      fromCurrency: '',
      enabled: 'yes',
      disabledSites: ['Example.com ', '', null, 'shop.example.com', 'Example.com']
    },
    {
      targetCurrencyBackup: 'gbp',
      fromCurrencyBackup: 'cad'
    }
  );

  assert.deepEqual(resolved, {
    targetCurrency: 'GBP',
    fromCurrency: 'CAD',
    enabled: DEFAULT_SYNC_SETTINGS.enabled,
    disabledSites: ['example.com', 'shop.example.com'],
    symbolCurrencies: {},
    siteCurrencies: {}
  });
});

test('currency override maps keep only valid entries', () => {
  assert.deepEqual(normalizeSymbolCurrencies({ kr: 'dkk', $: 'CAD ', '': 'NOK', '¥': 'yen!', toolongsymbol: 'USD' }), {
    kr: 'DKK',
    $: 'CAD'
  });
  assert.deepEqual(normalizeSiteCurrencies({ ' Example.DK ': 'nok', 'bad.com': 7, 'other.se': 'SEK' }), {
    'example.dk': 'NOK',
    'other.se': 'SEK'
  });
  for (const value of [null, [], 'DKK', 3]) {
    assert.deepEqual(normalizeSymbolCurrencies(value), {});
    assert.deepEqual(normalizeSiteCurrencies(value), {});
  }
});

test('site currency overrides keep the most recent entries within the sync quota', () => {
  const entries = Array.from({ length: MAX_SITE_CURRENCIES + 5 }, (_, index) => [`site${index}.com`, 'DKK']);
  const normalized = normalizeSiteCurrencies(Object.fromEntries(entries));
  assert.equal(Object.keys(normalized).length, MAX_SITE_CURRENCIES);
  assert.equal(Object.keys(normalized)[0], 'site5.com');
});

test('site currency lookup uses current and legacy site keys', () => {
  const siteCurrencies = { 'example.co.uk': 'GBP', 'co.uk': 'USD' };
  assert.equal(getSiteCurrency(siteCurrencies, getSiteKeys('shop.example.co.uk')), 'GBP');
  assert.equal(getSiteCurrency({ 'co.uk': 'USD' }, getSiteKeys('shop.example.co.uk')), 'USD');
  assert.equal(getSiteCurrency({}, ['constructor']), null);
});

test('collectChangedSettings compares override maps by value', () => {
  assert.deepEqual(
    collectChangedSettings(
      { symbolCurrencies: { kr: 'DKK' }, siteCurrencies: null },
      { symbolCurrencies: { kr: 'DKK' }, siteCurrencies: {} }
    ),
    { siteCurrencies: {} }
  );
});

test('resolveLocalSettings normalizes invalid preferences and repairs currency backups', () => {
  const resolved = resolveLocalSettings(
    {
      decimalPlaces: 9,
      tooltipPosition: 'center',
      tooltipTheme: 'broken-theme',
      resultGradient: 'invalid-gradient',
      targetCurrencyBackup: '  ',
      fromCurrencyBackup: 'usd1'
    },
    {
      targetCurrency: 'JPY',
      fromCurrency: 'AUD'
    }
  );

  assert.deepEqual(resolved, {
    decimalPlaces: DEFAULT_LOCAL_SETTINGS.decimalPlaces,
    tooltipPosition: DEFAULT_LOCAL_SETTINGS.tooltipPosition,
    tooltipTheme: DEFAULT_LOCAL_SETTINGS.tooltipTheme,
    resultGradient: DEFAULT_LOCAL_SETTINGS.resultGradient,
    targetCurrencyBackup: 'JPY',
    fromCurrencyBackup: 'AUD'
  });
});
