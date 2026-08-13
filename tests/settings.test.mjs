import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectChangedSettings,
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  VALID_RESULT_GRADIENTS,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';
import { RESULT_GRADIENT_STYLES } from '../lib/result-gradients.js';

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
    disabledSites: ['example.com', 'shop.example.com']
  });
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
