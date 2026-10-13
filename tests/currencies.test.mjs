import test from 'node:test';
import assert from 'node:assert/strict';

import '../lib/currencies.js';

const { CURRENCY_SYMBOLS, SYMBOL_TO_CURRENCY, SUPPORTED_CURRENCIES, getFlag, getCurrencyLabel } = globalThis.HCCCurrencies;

test('flags are derived from currency codes with shared-currency overrides', () => {
  assert.equal(getFlag('DKK'), '🇩🇰');
  assert.equal(getFlag('eur'), '🇪🇺');
  assert.equal(getFlag('ANG'), '🇨🇼');
  assert.equal(getFlag('XCD'), '🌐');
  assert.equal(getFlag('X1Z'), '💱');
});

test('tooltip labels combine flag and symbol', () => {
  assert.equal(getCurrencyLabel('DKK'), '🇩🇰 kr');
  assert.equal(getCurrencyLabel('BRL'), '🇧🇷 R$');
  assert.equal(getCurrencyLabel('ABC'), '🇦🇧 ABC');
});

test('every unambiguous symbol maps to a supported currency', () => {
  assert.equal(SUPPORTED_CURRENCIES.size, Object.keys(CURRENCY_SYMBOLS).length);
  for (const [symbol, code] of Object.entries(SYMBOL_TO_CURRENCY)) {
    assert.ok(SUPPORTED_CURRENCIES.has(code), `${symbol} maps to unsupported ${code}`);
  }
});