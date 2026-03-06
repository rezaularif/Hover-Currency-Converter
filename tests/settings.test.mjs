import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';

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
