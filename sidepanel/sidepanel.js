import {
  collectChangedSettings,
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  VALID_RESULT_GRADIENTS,
  getSiteCurrency,
  normalizeDisabledSites,
  normalizeSiteCurrencies,
  normalizeSymbolCurrencies,
  getRootDomain,
  getSiteKeys,
  resolveDisplaySettings,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';
import { fetchJsonWithRetry } from '../lib/network.js';
import { RESULT_GRADIENT_STYLES } from '../lib/result-gradients.js';
import '../lib/currencies.js';
import '../lib/currency-detection.js';
import { createCurrencyPicker } from './currency-picker.js';

const { getFlag } = globalThis.HCCCurrencies;
const { SYMBOL_GROUPS } = globalThis.HCCCurrencyDetection;

const ISO_FIAT_CODES = new Set(
  Intl.supportedValuesOf('currency').map(code => code.toLowerCase())
);

// Common cryptocurrency codes to exclude
const CRYPTO_CURRENCIES = new Set([
  'btc', 'eth', 'ltc', 'xrp', 'bch', 'bnb', 'usdt', 'usdc', 'doge', 'ada',
  'dot', 'sol', 'matic', 'avax', 'link', 'uni', 'atom', 'xlm', 'etc', 'trx',
  'xmr', 'eos', 'aave', 'mkr', 'comp', 'yfi', 'sushi', 'snx', 'crv', '1inch'
]);

const NON_FIAT_ASSET_CODES = new Set(['xag', 'xau', 'xpd', 'xpt', 'xdr']);
const FIAT_NAME_PATTERNS = [
  /(?:^|[^a-z])(afghani|ariary|balboa|birr|bol[ií]var|boliviano|cedi|colon|cordoba|denar|dinar|dirham|dobra|dollar|dong|dram|escudo|euro|fils|forint|franc|gourde|guarani|guilder|hryvnia|kip|koruna|krona|krone|kuna|kwacha|kwanza|lari|lats|lek|lempira|leone|lev|lilangeni|lira|litas|loti|manat|mark|metical|naira|ngultrum|ouguiya|pataca|peso|pound|pula|quetzal|rand|real|rial|riyal|riel|ringgit|ruble|rupee|rupiah|shekel|shilling|sol|somoni|som|sterling|taka|tenge|tugrik|vatu|won|yen|yuan|zloty|cfa|cfp)(?:$|[^a-z])/i
];
const NON_FIAT_NAME_PATTERNS = [
  /bitcoin|ethereum|tether|usd coin|dogecoin|binance coin|cryptocurrency|crypto|stablecoin|token|network|protocol|governance|defi|staking|swap|yield|dao/i,
  /gold|silver|palladium|platinum|precious metal|commodity/i,
  /special drawing rights/i
];

const CURRENCIES_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const CURRENCIES_API_FALLBACK_URL = 'https://latest.currency-api.pages.dev/v1/currencies.json';
const CURRENCIES_CACHE_DURATION = 24 * 60 * 60 * 1000;
const CURRENCIES_API_TIMEOUT_MS = 10000;
const DEFAULT_TARGET_CURRENCY = DEFAULT_SYNC_SETTINGS.targetCurrency;
const DEFAULT_FROM_CURRENCY = DEFAULT_SYNC_SETTINGS.fromCurrency;
const DEFAULT_RESULT_GRADIENT = DEFAULT_LOCAL_SETTINGS.resultGradient;

function isValidCurrenciesResponse(data) {
  return Boolean(data && typeof data === 'object' && !Array.isArray(data));
}

async function fetchCurrenciesFromUrl(url) {
  const data = await fetchJsonWithRetry(url, {
    timeoutMs: CURRENCIES_API_TIMEOUT_MS
  });
  if (!isValidCurrenciesResponse(data)) {
    throw new Error('Invalid currencies API response');
  }
  return data;
}

async function fetchCurrencies() {
  const now = Date.now();
  let cached = {
    currenciesList: null,
    currenciesListFetchedAt: 0
  };

  try {
    cached = await chrome.storage.local.get(cached);
    if (
      cached.currenciesList &&
      cached.currenciesListFetchedAt &&
      (now - cached.currenciesListFetchedAt) < CURRENCIES_CACHE_DURATION
    ) {
      return cached.currenciesList;
    }

    let data;
    try {
      data = await fetchCurrenciesFromUrl(CURRENCIES_API_URL);
    } catch {
      data = await fetchCurrenciesFromUrl(CURRENCIES_API_FALLBACK_URL);
    }

    await chrome.storage.local.set({
      currenciesList: data,
      currenciesListFetchedAt: now
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    return cached.currenciesList || null;
  }
}

const POPULAR_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'cny', 'inr', 'cad', 'aud', 'chf', 'krw'];

function isFiatCurrencyEntry(code, name) {
  if (typeof code !== 'string' || typeof name !== 'string') return false;

  const codeLower = code.toLowerCase();
  const normalizedName = name.trim().toLowerCase();

  if (!/^[a-z]{3}$/.test(codeLower)) return false;
  if (CRYPTO_CURRENCIES.has(codeLower)) return false;
  if (NON_FIAT_ASSET_CODES.has(codeLower)) return false;
  if (NON_FIAT_NAME_PATTERNS.some(pattern => pattern.test(normalizedName))) return false;
  if (ISO_FIAT_CODES.has(codeLower)) return true;
  if (!FIAT_NAME_PATTERNS.some(pattern => pattern.test(normalizedName))) return false;

  return true;
}

const currencyEntriesCache = new WeakMap();

function getCurrencyEntries(currencies) {
  if (currencyEntriesCache.has(currencies)) return currencyEntriesCache.get(currencies);

  const fiatCodes = Object.entries(currencies)
    .filter(([code, name]) => isFiatCurrencyEntry(code, name))
    .map(([code]) => code.toLowerCase());
  const popular = POPULAR_CURRENCIES.filter(code => fiatCodes.includes(code));
  const others = fiatCodes.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();
  const list = [...popular, ...others].map(code => {
    const upperCode = code.toUpperCase();
    const flag = getFlag(upperCode);
    const name = currencies[code] || upperCode;
    return {
      code: upperCode,
      label: `${flag} ${upperCode} - ${name}`,
      shortLabel: `${flag} ${upperCode}`,
      search: `${upperCode} ${name}`.toLowerCase()
    };
  });
  const entries = { list, byCode: new Map(list.map(entry => [entry.code, entry])) };
  currencyEntriesCache.set(currencies, entries);
  return entries;
}

function persistCurrencySelection(partial) {
  const syncUpdates = {};
  const localUpdates = {};

  if (partial.targetCurrency) {
    syncUpdates.targetCurrency = partial.targetCurrency;
    localUpdates.targetCurrencyBackup = partial.targetCurrency;
  }
  if (partial.fromCurrency) {
    syncUpdates.fromCurrency = partial.fromCurrency;
    localUpdates.fromCurrencyBackup = partial.fromCurrency;
  }

  const writes = [];
  if (Object.keys(syncUpdates).length > 0) {
    writes.push(chrome.storage.sync.set(syncUpdates));
  }
  if (Object.keys(localUpdates).length > 0) {
    writes.push(chrome.storage.local.set(localUpdates));
  }

  if (writes.length > 0) {
    Promise.all(writes).catch(error => {
      console.error('Failed to persist currency selection:', error);
    });
  }
}

let currentDecimalPlaces = 2;

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const fromAmount = document.getElementById('fromAmount');
  const convertResult = document.getElementById('convertResult');
  const resultCurrency = document.getElementById('resultCurrency');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  const swapBtn = document.getElementById('swapBtn');
  const decimalPlacesSelect = document.getElementById('decimalPlaces');
  const tooltipPositionSelect = document.getElementById('tooltipPosition');
  const tooltipThemeSelect = document.getElementById('tooltipTheme');
  const resultGradientSelect = document.getElementById('resultGradient');
  

  // Per-site elements
  const siteToggle = document.getElementById('siteToggle');
  const siteToggleRow = document.getElementById('siteToggleRow');
  const currentSiteDisplay = document.getElementById('currentSiteDisplay');
  const siteCurrencyRow = document.getElementById('siteCurrencyRow');
  const siteCurrencySite = document.getElementById('siteCurrencySite');
  const siteCurrencySelect = document.getElementById('siteCurrency');
  const symbolDetails = document.getElementById('symbolDetails');
  const symbolCurrencyList = document.getElementById('symbolCurrencyList');

  let currentRootDomain = null;
  let currentSiteKeys = [];
  let siteContextRequest = 0;
  let syncWriteQueue = Promise.resolve();
  let currenciesLoadFailed = false;
  let currencyEntries = null;
  let symbolDefaultsRendered = false;

  const converterSection = document.querySelector('.converter-section');
  
  const targetPicker = createCurrencyPicker(document.getElementById('targetCurrencyPicker'), {
    idPrefix: 'target-currency',
    onSelect: selectTargetCurrency
  });
  const sourcePicker = createCurrencyPicker(document.getElementById('sourceCurrencyPicker'), {
    idPrefix: 'source-currency',
    compact: true,
    onSelect: selectSourceCurrency
  });

  function queueSyncWrite(write) {
    syncWriteQueue = syncWriteQueue.then(write).catch(error => {
      console.error('Failed to save settings:', error);
    });
    return syncWriteQueue;
  }

  function setSiteContext(rootDomain, siteKeys) {
    currentRootDomain = rootDomain;
    currentSiteKeys = siteKeys;
    const display = rootDomain ? '' : 'none';
    siteToggleRow.style.display = display;
    siteCurrencyRow.style.display = display;
  }

  async function refreshSiteContext() {
    const request = ++siteContextRequest;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url ? new URL(tab.url) : null;
      if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
        if (request === siteContextRequest) setSiteContext(null, []);
        return;
      }

      const rootDomain = getRootDomain(url.hostname);
      const siteKeys = getSiteKeys(url.hostname);
      const stored = await chrome.storage.sync.get({ disabledSites: [], siteCurrencies: {} });
      if (request !== siteContextRequest) return;

      currentSiteDisplay.textContent = rootDomain;
      siteCurrencySite.textContent = rootDomain;
      siteToggle.checked = !normalizeDisabledSites(stored.disabledSites).some(site => siteKeys.includes(site));
      siteCurrencySelect.value = getSiteCurrency(normalizeSiteCurrencies(stored.siteCurrencies), siteKeys) || '';
      setSiteContext(rootDomain, siteKeys);
    } catch (error) {
      console.error('Failed to load site settings:', error);
      if (request === siteContextRequest) setSiteContext(null, []);
    }
  }

  function createCurrencyOption(code) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${getFlag(code)} ${code}`;
    return option;
  }

  function createAutoOption(label) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = label;
    return option;
  }

  function populateSiteCurrencySelect() {
    const listedCodes = new Set();
    const optionGroups = [];
    for (const group of Object.values(SYMBOL_GROUPS)) {
      const codes = group.candidates.filter(code => !listedCodes.has(code));
      if (codes.length === 0) continue;
      const optionGroup = document.createElement('optgroup');
      optionGroup.label = `${group.label} prices`;
      for (const code of codes) {
        listedCodes.add(code);
        optionGroup.appendChild(createCurrencyOption(code));
      }
      optionGroups.push(optionGroup);
    }
    siteCurrencySelect.replaceChildren(createAutoOption('Auto-detect'), ...optionGroups);
  }

  function populateSymbolCurrencyList(symbolCurrencies) {
    const rows = Object.entries(SYMBOL_GROUPS).map(([symbol, group]) => {
      const row = document.createElement('div');
      row.className = 'preference-row symbol-row';
      const label = document.createElement('span');
      label.className = 'preference-label';
      label.textContent = group.label;
      const select = document.createElement('select');
      select.className = 'preference-select';
      select.dataset.symbol = symbol;
      select.setAttribute('aria-label', `Default currency for ${group.label}`);
      select.replaceChildren(createAutoOption('Auto'), ...group.candidates.map(createCurrencyOption));
      select.value = Object.hasOwn(symbolCurrencies, symbol) ? symbolCurrencies[symbol] : '';
      row.append(label, select);
      return row;
    });
    symbolCurrencyList.replaceChildren(...rows);
  }

  async function renderSymbolDefaults() {
    if (symbolDefaultsRendered) return;
    symbolDefaultsRendered = true;
    try {
      const stored = await chrome.storage.sync.get({ symbolCurrencies: {} });
      populateSymbolCurrencyList(normalizeSymbolCurrencies(stored.symbolCurrencies));
    } catch (error) {
      console.error('Failed to load currency detection settings:', error);
      populateSymbolCurrencyList({});
    }
  }

  async function initCurrencies() {
    try {
      const currencies = await fetchCurrencies();
      if (!currencies) {
        setCurrenciesUnavailable();
        return;
      }

      currenciesLoadFailed = false;
      currencyEntries = getCurrencyEntries(currencies);

      const [syncSaved, localSaved] = await Promise.all([
        chrome.storage.sync.get({
          targetCurrency: null,
          fromCurrency: null
        }),
        chrome.storage.local.get({
          targetCurrencyBackup: null,
          fromCurrencyBackup: null
        })
      ]);

      const normalizedSyncSettings = resolveSyncSettings(syncSaved, localSaved);
      const normalizedLocalSettings = resolveLocalSettings(localSaved, normalizedSyncSettings);
      const resolvedTarget = normalizedSyncSettings.targetCurrency;
      const resolvedFrom = normalizedSyncSettings.fromCurrency;
      const availableCodes = currencyEntries.list.map(entry => entry.code);
      const availableSet = new Set(availableCodes);
      const firstAvailableCode = availableCodes[0] || DEFAULT_TARGET_CURRENCY;

      const savedTarget = availableSet.has(resolvedTarget)
        ? resolvedTarget
        : (availableSet.has(DEFAULT_TARGET_CURRENCY) ? DEFAULT_TARGET_CURRENCY : firstAvailableCode);
      const savedFrom = availableSet.has(resolvedFrom)
        ? resolvedFrom
        : (availableSet.has(DEFAULT_FROM_CURRENCY) ? DEFAULT_FROM_CURRENCY : firstAvailableCode);

      if (
        normalizedSyncSettings.targetCurrency !== savedTarget ||
        normalizedSyncSettings.fromCurrency !== savedFrom ||
        normalizedLocalSettings.targetCurrencyBackup !== savedTarget ||
        normalizedLocalSettings.fromCurrencyBackup !== savedFrom ||
        resolvedTarget !== savedTarget || resolvedFrom !== savedFrom
      ) {
        persistCurrencySelection({
          targetCurrency: savedTarget,
          fromCurrency: savedFrom
        });
      }

      targetPicker.setEntries(currencyEntries, savedTarget);
      sourcePicker.setEntries(currencyEntries, savedFrom);

      resultCurrency.textContent = savedTarget;
      doQuickConvert();
    } catch (error) {
      console.error('Failed to initialize currencies:', error);
      setCurrenciesUnavailable();
    }
  }

  function setCurrenciesUnavailable() {
    currenciesLoadFailed = true;
    targetPicker.setUnavailable('Unavailable');
    sourcePicker.setUnavailable('Unavailable');
    swapBtn.disabled = true;
    resultCurrency.textContent = '--';
    convertResult.querySelector('.result-amount').textContent = 'Error';
    statusDot.classList.remove('success');
    statusDot.classList.add('error');
    statusText.textContent = 'Failed to load currency list';
  }
  
  function selectTargetCurrency(code) {
    resultCurrency.textContent = code;
    persistCurrencySelection({ targetCurrency: code });
    doQuickConvert();
  }

  function selectSourceCurrency(code) {
    persistCurrencySelection({ fromCurrency: code });
    doQuickConvert();
  }
  
  const currenciesReady = initCurrencies();

  populateSiteCurrencySelect();
  symbolDetails.addEventListener('toggle', () => {
    if (symbolDetails.open) renderSymbolDefaults();
  });
  refreshSiteContext();
  chrome.tabs.onActivated.addListener(() => refreshSiteContext());
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && (changeInfo.url || changeInfo.status === 'complete')) {
      refreshSiteContext();
    }
  });
  // Load saved settings with defaults (Issue 3: Storage initialization)
  chrome.storage.sync.get({ enabled: true }, (result) => {
    enableToggle.checked = result.enabled;
  });

  // Load all local storage data in one call with defaults
  chrome.storage.local.get({
    decimalPlaces: 2,
    tooltipPosition: 'below',
    tooltipTheme: 'purple-gradient',
    resultGradient: DEFAULT_RESULT_GRADIENT,
    lastFetch: null
  }, async (result) => {
    const normalizedDisplaySettings = resolveDisplaySettings(result);

    // User preferences
    currentDecimalPlaces = normalizedDisplaySettings.decimalPlaces;
    decimalPlacesSelect.value = currentDecimalPlaces;
    tooltipPositionSelect.value = normalizedDisplaySettings.tooltipPosition;
    tooltipThemeSelect.value = normalizedDisplaySettings.tooltipTheme;

    // Apply result gradient
    const savedGradient = normalizedDisplaySettings.resultGradient;
    resultGradientSelect.value = savedGradient;
    applyResultGradient(savedGradient);

    const localUpdates = collectChangedSettings(result, normalizedDisplaySettings);
    if (Object.keys(localUpdates).length > 0) {
      chrome.storage.local.set(localUpdates);
    }

    await currenciesReady;

    if (currenciesLoadFailed) {
      statusDot.classList.remove('success');
      statusDot.classList.add('error');
      statusText.textContent = 'Failed to load currency list';
      return;
    }

    // Rates status
    function setRateStatus(timestamp) {
      statusDot.classList.remove('error');
      statusDot.classList.add('success');
      if (!timestamp) {
        statusText.textContent = 'Rates loaded successfully';
        return;
      }
      const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
      if (diffMinutes < 1) {
        statusText.textContent = 'Rates updated just now';
      } else if (diffMinutes < 60) {
        statusText.textContent = `Rates updated ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        statusText.textContent = `Rates updated ${diffHours}h ago`;
      }
    }

    const diffMinutes = result.lastFetch ? Math.floor((Date.now() - result.lastFetch) / 60000) : Infinity;
    if (diffMinutes < 60) {
      setRateStatus(result.lastFetch);
    } else {
      chrome.runtime.sendMessage({ type: 'getRates' }, (response) => {
        if (response?.success) {
          setRateStatus(response.lastFetch || result.lastFetch);
        } else if (result.lastFetch) {
          setRateStatus(result.lastFetch);
        } else {
          statusDot.classList.remove('success');
          statusDot.classList.add('error');
          statusText.textContent = 'Failed to load rates';
        }
      });
    }
  });
 
  // Event listeners
  enableToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enableToggle.checked });
  });
 

  siteToggle.addEventListener('change', () => {
    const rootDomain = currentRootDomain;
    const siteKeys = currentSiteKeys;
    const isEnabled = siteToggle.checked;
    if (!rootDomain) return;
    queueSyncWrite(async () => {
      const stored = await chrome.storage.sync.get({ disabledSites: [] });
      let disabledSites = normalizeDisabledSites(stored.disabledSites);
      if (isEnabled) {
        disabledSites = disabledSites.filter(site => !siteKeys.includes(site));
      } else if (!disabledSites.includes(rootDomain)) {
        disabledSites.push(rootDomain);
      }
      await chrome.storage.sync.set({ disabledSites });
    });
  });

  siteCurrencySelect.addEventListener('change', () => {
    const rootDomain = currentRootDomain;
    const siteKeys = currentSiteKeys;
    const currency = siteCurrencySelect.value;
    if (!rootDomain) return;
    queueSyncWrite(async () => {
      const stored = await chrome.storage.sync.get({ siteCurrencies: {} });
      const siteCurrencies = Object.fromEntries(Object.entries(normalizeSiteCurrencies(stored.siteCurrencies))
        .filter(([site]) => !siteKeys.includes(site)));
      if (currency) siteCurrencies[rootDomain] = currency;
      await chrome.storage.sync.set({ siteCurrencies: normalizeSiteCurrencies(siteCurrencies) });
    });
  });

  symbolCurrencyList.addEventListener('change', (event) => {
    const symbol = event.target.dataset?.symbol;
    if (!symbol) return;
    const currency = event.target.value;
    queueSyncWrite(async () => {
      const stored = await chrome.storage.sync.get({ symbolCurrencies: {} });
      const symbolCurrencies = normalizeSymbolCurrencies(stored.symbolCurrencies);
      delete symbolCurrencies[symbol];
      if (currency) symbolCurrencies[symbol] = currency;
      await chrome.storage.sync.set({ symbolCurrencies });
    });
  });
 
  fromAmount.addEventListener('input', doQuickConvert);

  // Preference event listeners
  decimalPlacesSelect.addEventListener('change', () => {
    currentDecimalPlaces = parseInt(decimalPlacesSelect.value, 10);
    chrome.storage.local.set({ decimalPlaces: currentDecimalPlaces });
    doQuickConvert();
  });

  tooltipPositionSelect.addEventListener('change', () => {
    chrome.storage.local.set({ tooltipPosition: tooltipPositionSelect.value });
  });

  tooltipThemeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ tooltipTheme: tooltipThemeSelect.value });
  });

  resultGradientSelect.addEventListener('change', () => {
    const gradient = VALID_RESULT_GRADIENTS.has(resultGradientSelect.value)
      ? resultGradientSelect.value
      : DEFAULT_RESULT_GRADIENT;
    resultGradientSelect.value = gradient;
    chrome.storage.local.set({ resultGradient: gradient });
    applyResultGradient(gradient);
  });

  function applyResultGradient(gradient) {
    const normalizedGradient = VALID_RESULT_GRADIENTS.has(gradient)
      ? gradient
      : DEFAULT_RESULT_GRADIENT;
    const styles = RESULT_GRADIENT_STYLES[normalizedGradient]
      || RESULT_GRADIENT_STYLES[DEFAULT_RESULT_GRADIENT];
    const [background, shadow, border, secondaryShadow, highlight, outline] = styles;
    converterSection.style.setProperty('--result-background', background);
    converterSection.style.setProperty('--result-shadow', shadow);
    converterSection.style.setProperty('--result-border', border);
    converterSection.style.setProperty('--result-secondary-shadow', secondaryShadow || 'rgba(0, 0, 0, 0.2)');
    converterSection.style.setProperty('--result-highlight', highlight || 'rgba(255, 255, 255, 0.3)');
    converterSection.style.setProperty('--result-outline', outline || 'rgba(255, 255, 255, 0.2)');
  }

  // Swap button functionality
  swapBtn.addEventListener('click', () => {
    const currentFrom = sourcePicker.getValue();
    const currentTo = targetPicker.getValue();

    if (currentFrom && currentTo && currencyEntries) {
      sourcePicker.setValue(currentTo);
      targetPicker.setValue(currentFrom);
      resultCurrency.textContent = currentFrom;

      persistCurrencySelection({
        targetCurrency: currentFrom,
        fromCurrency: currentTo
      });
      doQuickConvert();
    }
  });

  let conversionRequestId = 0;
  const resultFormats = new Map();

  function formatResult(value) {
    let format = resultFormats.get(currentDecimalPlaces);
    if (!format) {
      format = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: currentDecimalPlaces,
        maximumFractionDigits: currentDecimalPlaces
      });
      resultFormats.set(currentDecimalPlaces, format);
    }
    return format.format(value);
  }

  async function doQuickConvert() {
    const requestId = ++conversionRequestId;
    const resultAmount = convertResult.querySelector('.result-amount');
    const amount = Number(fromAmount.value);
    const fromCurrency = sourcePicker.getValue();
    const toCurrency = targetPicker.getValue();
    if (!Number.isFinite(amount) || amount <= 0 || !fromCurrency || !toCurrency) {
      resultAmount.textContent = '--';
      return;
    }

    resultAmount.textContent = '--';
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'convert',
        amount,
        fromCurrency,
        toCurrency
      });
      if (requestId !== conversionRequestId) return;
      resultAmount.textContent = response?.success && Number.isFinite(response.converted)
        ? formatResult(response.converted)
        : 'Error';
    } catch (error) {
      if (requestId === conversionRequestId) resultAmount.textContent = 'Error';
      console.error('Failed to convert amount:', error);
    }
  }
});
