import './settings-core.js';

export const {
  DEFAULT_SYNC_SETTINGS,
  DEFAULT_LOCAL_SETTINGS,
  MAX_SITE_CURRENCIES,
  VALID_TOOLTIP_POSITIONS,
  VALID_TOOLTIP_THEMES,
  VALID_RESULT_GRADIENTS,
  normalizeCurrencyCode,
  normalizeDecimalPlaces,
  normalizeTooltipPosition,
  normalizeTooltipTheme,
  normalizeResultGradient,
  normalizeDisabledSites,
  normalizeSymbolCurrencies,
  normalizeSiteCurrencies,
  getSiteCurrency,
  resolveSyncSettings,
  resolveDisplaySettings,
  resolveLocalSettings,
  collectChangedSettings,
  getRootDomain,
  getSiteKeys
} = globalThis.HCCSettingsCore;
