import test from 'node:test';
import assert from 'node:assert/strict';

import '../lib/currency-parser.js';

const parseCurrency = globalThis.HCCCurrencyParser.createCurrencyParser({
  symbolToCurrency: {
    'R$': 'BRL',
    '$': 'USD',
    '€': 'EUR',
    '₹': 'INR'
  },
  validCurrencyCodes: new Set(['BRL', 'EUR', 'INR', 'USD'])
});

const cases = [
  ['€10,39', { currency: 'EUR', amount: 10.39 }],
  ['€1.039,00', { currency: 'EUR', amount: 1039 }],
  ['$1,039.00', { currency: 'USD', amount: 1039 }],
  ['USD 1,234.56', { currency: 'USD', amount: 1234.56 }],
  ['1.234,56 EUR', { currency: 'EUR', amount: 1234.56 }],
  ['R$ 19,99', { currency: 'BRL', amount: 19.99 }],
  ['€1 234,56', { currency: 'EUR', amount: 1234.56 }],
  ['$1,234', { currency: 'USD', amount: 1234 }],
  ['₹1,23,456', { currency: 'INR', amount: 123456 }],
  ['INR 12,34,567', { currency: 'INR', amount: 1234567 }],
  ['49 €', { currency: 'EUR', amount: 49 }]
];

for (const [input, expected] of cases) {
  test(`parses ${input}`, () => {
    assert.deepEqual(parseCurrency(input), expected);
  });
}

test('rejects unknown currency codes and invalid amounts', () => {
  assert.equal(parseCurrency('ABC 10.00'), null);
  assert.equal(parseCurrency('€0'), null);
  assert.equal(parseCurrency('€1,23,45'), null);
  assert.equal(parseCurrency('€1.23,45.67'), null);
  assert.equal(parseCurrency('$1,23.45'), null);
  assert.equal(parseCurrency('not a price'), null);
});

test('skips invalid leading matches to find a valid price later in the text', () => {
  assert.deepEqual(parseCurrency('Code: ABC 100 | Price: USD 50'), { currency: 'USD', amount: 50 });
  assert.deepEqual(parseCurrency('$0 / $19.99'), { currency: 'USD', amount: 19.99 });
  assert.deepEqual(parseCurrency('100 ABC or 25 EUR'), { currency: 'EUR', amount: 25 });
  assert.deepEqual(parseCurrency('₹12,34,567.89'), { currency: 'INR', amount: 1234567.89 });
});

const parseWithSharedSymbols = globalThis.HCCCurrencyParser.createCurrencyParser({
  symbolToCurrency: { 'US$': 'USD', 'CN¥': 'CNY', '円': 'JPY', 'zł': 'PLN', '€': 'EUR' },
  ambiguousSymbols: { '$': '$', '¥': '¥', 'kr.': 'kr', 'kr': 'kr', 'Rs.': 'Rs', 'Rs': 'Rs', '元': '元' },
  validCurrencyCodes: new Set(['USD', 'CNY', 'JPY', 'PLN', 'EUR'])
});

const sharedSymbolCases = [
  ['199 kr.', { symbol: 'kr', amount: 199 }],
  ['kr. 1.299,00', { symbol: 'kr', amount: 1299 }],
  ['1 299,00 kr', { symbol: 'kr', amount: 1299 }],
  ['kr 249', { symbol: 'kr', amount: 249 }],
  ['Rs. 1,499', { symbol: 'Rs', amount: 1499 }],
  ['$20', { symbol: '$', amount: 20 }],
  ['US$20', { currency: 'USD', amount: 20 }],
  ['CN¥ 99', { currency: 'CNY', amount: 99 }],
  ['¥1,980', { symbol: '¥', amount: 1980 }],
  ['1,980円', { currency: 'JPY', amount: 1980 }],
  ['99元起', { symbol: '元', amount: 99 }],
  ['49 zł', { currency: 'PLN', amount: 49 }]
];

for (const [input, expected] of sharedSymbolCases) {
  test(`parses shared-symbol price ${input}`, () => {
    assert.deepEqual(parseWithSharedSymbols(input), expected);
  });
}

test('letter symbols only match as whole words', () => {
  assert.equal(parseWithSharedSymbols('5 krabber'), null);
  assert.equal(parseWithSharedSymbols('Ukraine 2024'), null);
  assert.equal(parseWithSharedSymbols('Mrs 5'), null);
});
