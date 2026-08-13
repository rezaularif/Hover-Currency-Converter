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
  assert.equal(parseCurrency('not a price'), null);
});
