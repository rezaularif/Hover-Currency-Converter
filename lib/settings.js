export const DEFAULT_SYNC_SETTINGS = {
  targetCurrency: 'EUR',
  fromCurrency: 'USD',
  enabled: true,
  disabledSites: []
};

export const DEFAULT_LOCAL_SETTINGS = {
  decimalPlaces: 2,
  tooltipPosition: 'below',
  tooltipTheme: 'purple-gradient',
  resultGradient: 'purple-orange',
  targetCurrencyBackup: 'EUR',
  fromCurrencyBackup: 'USD'
};

export const VALID_TOOLTIP_POSITIONS = new Set(['above', 'below', 'left', 'right']);
export const VALID_TOOLTIP_THEMES = new Set([
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
export const VALID_RESULT_GRADIENTS = new Set([
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

export function normalizeCurrencyCode(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

export function normalizeDecimalPlaces(value) {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 4) {
    return numeric;
  }
  return DEFAULT_LOCAL_SETTINGS.decimalPlaces;
}

export function normalizeTooltipPosition(value) {
  return VALID_TOOLTIP_POSITIONS.has(value) ? value : DEFAULT_LOCAL_SETTINGS.tooltipPosition;
}

export function normalizeTooltipTheme(value) {
  return VALID_TOOLTIP_THEMES.has(value) ? value : DEFAULT_LOCAL_SETTINGS.tooltipTheme;
}

export function normalizeResultGradient(value) {
  return VALID_RESULT_GRADIENTS.has(value) ? value : DEFAULT_LOCAL_SETTINGS.resultGradient;
}

export function normalizeDisabledSites(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  for (const site of value) {
    if (typeof site !== 'string') {
      continue;
    }

    const cleaned = site.trim().toLowerCase();
    if (!cleaned || seen.has(cleaned)) {
      continue;
    }

    seen.add(cleaned);
    normalized.push(cleaned);
  }

  return normalized;
}

export function resolveSyncSettings(syncValues = {}, localValues = {}) {
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
    disabledSites: normalizeDisabledSites(syncValues.disabledSites)
  };
}

export function resolveDisplaySettings(localValues = {}) {
  return {
    decimalPlaces: normalizeDecimalPlaces(localValues.decimalPlaces),
    tooltipPosition: normalizeTooltipPosition(localValues.tooltipPosition),
    tooltipTheme: normalizeTooltipTheme(localValues.tooltipTheme),
    resultGradient: normalizeResultGradient(localValues.resultGradient)
  };
}

export function resolveLocalSettings(localValues = {}, syncValues = {}) {
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
