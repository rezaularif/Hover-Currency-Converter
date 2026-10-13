(function(root) {
  const DEFAULT_SYNC_SETTINGS = {
    targetCurrency: 'EUR',
    fromCurrency: 'USD',
    enabled: true,
    disabledSites: [],
    symbolCurrencies: {},
    siteCurrencies: {}
  };

  const MAX_SITE_CURRENCIES = 200;

  const DEFAULT_LOCAL_SETTINGS = {
    decimalPlaces: 2,
    tooltipPosition: 'below',
    tooltipTheme: 'purple-gradient',
    resultGradient: 'purple-orange',
    targetCurrencyBackup: 'EUR',
    fromCurrencyBackup: 'USD'
  };

  const VALID_TOOLTIP_POSITIONS = new Set(['above', 'below', 'left', 'right']);
  const VALID_TOOLTIP_THEMES = new Set([
    'purple-gradient',
    'ocean-gradient',
    'sunset-gradient',
    'forest-gradient',
    'golden-gradient',
    'aurora-gradient',
    'ember-gradient',
    'midnight-gradient',
    'berry-gradient',
    'dark-gray',
    'navy-blue',
    'deep-purple',
    'teal',
    'slate',
    'charcoal',
    'cobalt',
    'burgundy',
    'emerald'
  ]);
  const VALID_RESULT_GRADIENTS = new Set([
    'purple-orange',
    'ocean-blue',
    'sunset',
    'forest',
    'golden',
    'purple-pink',
    'blue-cyan',
    'red-orange',
    'teal-green',
    'aurora',
    'ember',
    'midnight',
    'berry',
    'aqua-lime',
    'rose-gold',
    'cobalt-cyan',
    'graphite'
  ]);

  function normalizeCurrencyCode(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
  }

  function normalizeDecimalPlaces(value) {
    const numeric = typeof value === 'number' || (typeof value === 'string' && value.trim())
      ? Number(value)
      : NaN;
    if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 4) {
      return numeric;
    }
    return DEFAULT_LOCAL_SETTINGS.decimalPlaces;
  }

  function normalizeTooltipPosition(value) {
    return VALID_TOOLTIP_POSITIONS.has(value) ? value : DEFAULT_LOCAL_SETTINGS.tooltipPosition;
  }

  function normalizeTooltipTheme(value) {
    return VALID_TOOLTIP_THEMES.has(value) ? value : DEFAULT_LOCAL_SETTINGS.tooltipTheme;
  }

  function normalizeResultGradient(value) {
    return VALID_RESULT_GRADIENTS.has(value) ? value : DEFAULT_LOCAL_SETTINGS.resultGradient;
  }

  function normalizeDisabledSites(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value
      .filter(site => typeof site === 'string')
      .map(site => site.trim().toLowerCase())
      .filter(Boolean))];
  }

  function normalizeCurrencyMap(value, normalizeKey) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value)
      .map(([key, currency]) => [normalizeKey(key), normalizeCurrencyCode(currency)])
      .filter(([key, currency]) => key && currency));
  }

  function normalizeSymbolCurrencies(value) {
    return normalizeCurrencyMap(value, key => {
      const symbol = key.trim();
      return symbol.length <= 8 ? symbol : null;
    });
  }

  function normalizeSiteCurrencies(value) {
    const entries = Object.entries(normalizeCurrencyMap(value, key => key.trim().toLowerCase()));
    return Object.fromEntries(entries.slice(-MAX_SITE_CURRENCIES));
  }

  function getSiteCurrency(siteCurrencies, siteKeys) {
    const key = siteKeys.find(siteKey => Object.hasOwn(siteCurrencies, siteKey));
    return key ? siteCurrencies[key] : null;
  }

  function resolveSyncSettings(syncValues = {}, localValues = {}) {
    return {
      targetCurrency: normalizeCurrencyCode(syncValues.targetCurrency)
        || normalizeCurrencyCode(localValues.targetCurrencyBackup)
        || DEFAULT_SYNC_SETTINGS.targetCurrency,
      fromCurrency: normalizeCurrencyCode(syncValues.fromCurrency)
        || normalizeCurrencyCode(localValues.fromCurrencyBackup)
        || DEFAULT_SYNC_SETTINGS.fromCurrency,
      enabled: typeof syncValues.enabled === 'boolean'
        ? syncValues.enabled
        : DEFAULT_SYNC_SETTINGS.enabled,
      disabledSites: normalizeDisabledSites(syncValues.disabledSites),
      symbolCurrencies: normalizeSymbolCurrencies(syncValues.symbolCurrencies),
      siteCurrencies: normalizeSiteCurrencies(syncValues.siteCurrencies)
    };
  }

  function resolveDisplaySettings(localValues = {}) {
    return {
      decimalPlaces: normalizeDecimalPlaces(localValues.decimalPlaces),
      tooltipPosition: normalizeTooltipPosition(localValues.tooltipPosition),
      tooltipTheme: normalizeTooltipTheme(localValues.tooltipTheme),
      resultGradient: normalizeResultGradient(localValues.resultGradient)
    };
  }

  function resolveLocalSettings(localValues = {}, syncValues = {}) {
    const displaySettings = resolveDisplaySettings(localValues);

    return {
      ...displaySettings,
      targetCurrencyBackup: normalizeCurrencyCode(localValues.targetCurrencyBackup)
        || normalizeCurrencyCode(syncValues.targetCurrency)
        || DEFAULT_LOCAL_SETTINGS.targetCurrencyBackup,
      fromCurrencyBackup: normalizeCurrencyCode(localValues.fromCurrencyBackup)
        || normalizeCurrencyCode(syncValues.fromCurrency)
        || DEFAULT_LOCAL_SETTINGS.fromCurrencyBackup
    };
  }

  function collectChangedSettings(currentValues, normalizedValues) {
    return Object.fromEntries(
      Object.entries(normalizedValues).filter(([key, normalizedValue]) => {
        const currentValue = currentValues[key];
        return normalizedValue !== null && typeof normalizedValue === 'object'
          ? JSON.stringify(currentValue) !== JSON.stringify(normalizedValue)
          : currentValue !== normalizedValue;
      })
    );
  }

  const MULTI_PART_TLDS = new Set([
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
    'com.au', 'net.au', 'org.au',
    'co.nz', 'co.jp', 'co.kr', 'co.in', 'co.id', 'co.za',
    'com.br', 'com.mx', 'com.tr', 'com.sg', 'com.hk', 'com.cn', 'com.tw', 'com.ar', 'com.sa', 'com.eg', 'com.ng'
  ]);

  function normalizeHostname(hostname) {
    return hostname.toLowerCase().replace(/\.$/, '');
  }

  function isIpAddress(hostname) {
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
  }

  function getLegacyRootDomain(hostname) {
    const normalized = normalizeHostname(hostname);
    if (isIpAddress(normalized)) return normalized;
    const parts = normalized.split('.');
    if (parts.length <= 2) return normalized;
    return parts.slice(-2).join('.');
  }

  function getRootDomain(hostname) {
    const normalized = normalizeHostname(hostname);
    if (!normalized || normalized === 'localhost' || isIpAddress(normalized)) {
      return normalized;
    }

    const parts = normalized.split('.');
    if (parts.length <= 2) {
      return normalized;
    }

    const lastTwo = parts.slice(-2).join('.');
    if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) {
      return parts.slice(-3).join('.');
    }

    return lastTwo;
  }

  function getSiteKeys(hostname) {
    const rootDomain = getRootDomain(hostname);
    const legacyRootDomain = getLegacyRootDomain(hostname);
    if (rootDomain === legacyRootDomain) {
      return [rootDomain];
    }
    return [rootDomain, legacyRootDomain];
  }

  root.HCCSettingsCore = Object.freeze({
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
  });
})(globalThis);
