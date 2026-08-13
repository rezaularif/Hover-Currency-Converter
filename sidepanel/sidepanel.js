import {
  collectChangedSettings,
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  VALID_RESULT_GRADIENTS,
  normalizeDisabledSites,
  resolveDisplaySettings,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';
import { fetchJsonWithRetry } from '../lib/network.js';
import { RESULT_GRADIENT_STYLES } from '../lib/result-gradients.js';

const FLAG_OVERRIDES = {
  ANG: '🇨🇼', XAF: '🇨🇲', XCD: '🌐', XDR: '🌐', XOF: '🇧🇯', XPF: '🇵🇫'
};

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
const CURRENCIES_CACHE_DURATION = 24 * 60 * 60 * 1000;
const CURRENCIES_API_TIMEOUT_MS = 10000;
const DEFAULT_TARGET_CURRENCY = DEFAULT_SYNC_SETTINGS.targetCurrency;
const DEFAULT_FROM_CURRENCY = DEFAULT_SYNC_SETTINGS.fromCurrency;
const DEFAULT_RESULT_GRADIENT = DEFAULT_LOCAL_SETTINGS.resultGradient;

let allCurrencies = null;
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

    const data = await fetchJsonWithRetry(CURRENCIES_API_URL, {
      timeoutMs: CURRENCIES_API_TIMEOUT_MS
    });
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid currencies API response');
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

function countryCodeToFlag(countryCode) {
  if (!/^[A-Z]{2}$/.test(countryCode)) return null;
  const base = 127397;
  return String.fromCodePoint(
    countryCode.charCodeAt(0) + base,
    countryCode.charCodeAt(1) + base
  );
}

function getFlag(code) {
  const upperCode = code.toUpperCase();
  if (FLAG_OVERRIDES[upperCode]) return FLAG_OVERRIDES[upperCode];
  const derivedFlag = countryCodeToFlag(upperCode.slice(0, 2));
  return derivedFlag || '💱';
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

function getOrderedFiatCodes(currencies) {
  const allCodes = Object.entries(currencies)
    .filter(([code, name]) => isFiatCurrencyEntry(code, name))
    .map(([code]) => code.toLowerCase());

  const popular = POPULAR_CURRENCIES.filter(code => allCodes.includes(code));
  const others = allCodes.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();
  return [...popular, ...others];
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

function populateCurrencySelect(selectElement, currencies, selectedValue, isSmall = false) {
  selectElement.textContent = '';
  const orderedCodes = getOrderedFiatCodes(currencies);

  for (const code of orderedCodes) {
    const option = createOption(code, currencies[code], selectedValue, isSmall);
    selectElement.appendChild(option);
  }
}

function createOption(code, name, selectedValue, isSmall) {
  const option = document.createElement('option');
  option.value = code.toUpperCase();
  const flag = getFlag(code);
  if (isSmall) {
    option.textContent = `${flag} ${code.toUpperCase()}`;
  } else {
    option.textContent = `${flag} ${code.toUpperCase()} - ${name}`;
  }
  if (code.toUpperCase() === selectedValue) {
    option.selected = true;
  }
  return option;
}
  
let currentDecimalPlaces = 2;

document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const targetCurrency = document.getElementById('targetCurrency');
  const fromAmount = document.getElementById('fromAmount');
  const fromCurrency = document.getElementById('fromCurrency');
  const convertResult = document.getElementById('convertResult');
  const resultCurrency = document.getElementById('resultCurrency');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');
  const swapBtn = document.getElementById('swapBtn');
  const decimalPlacesSelect = document.getElementById('decimalPlaces');
  const tooltipPositionSelect = document.getElementById('tooltipPosition');
  const tooltipThemeSelect = document.getElementById('tooltipTheme');
  const resultGradientSelect = document.getElementById('resultGradient');
  

  // Per-site toggle elements
  const siteToggle = document.getElementById('siteToggle');
  const siteToggleRow = document.getElementById('siteToggleRow');
  const currentSiteDisplay = document.getElementById('currentSiteDisplay');

  const MULTI_PART_TLDS = new Set([
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
    'com.au', 'net.au', 'org.au',
    'co.nz', 'co.jp', 'co.kr', 'co.in', 'co.id', 'co.za',
    'com.br', 'com.mx', 'com.tr', 'com.sg', 'com.hk', 'com.cn', 'com.tw', 'com.ar', 'com.sa', 'com.eg', 'com.ng'
  ]);

  let currentRootDomain = null;
  let currentSiteKeys = [];
  let disabledSites = [];
  let currenciesLoadFailed = false;

  const converterSection = document.querySelector('.converter-section');
  
  // Target currency custom dropdown elements
  const targetCurrencyBtn = document.getElementById('targetCurrencyBtn');
  const targetCurrencyDisplay = document.getElementById('targetCurrencyDisplay');
  const targetCurrencyDropdown = document.getElementById('targetCurrencyDropdown');
  const targetCurrencyList = document.getElementById('targetCurrencyList');
  const targetCurrencySearch = document.getElementById('targetCurrencySearch');
  const targetCurrencyNoResults = document.getElementById('targetCurrencyNoResults');
  const targetCurrencyWrapper = document.querySelector('.custom-select-full');
  const targetSection = targetCurrencyWrapper ? targetCurrencyWrapper.closest('.section') : null;
  targetCurrencyBtn.setAttribute('aria-expanded', 'false');

  function normalizeHostname(hostname) {
    return hostname.toLowerCase().replace(/\.$/, '');
  }

  function isIpAddress(hostname) {
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
  }

  function getLegacyRootDomain(hostname) {
    const normalized = normalizeHostname(hostname);
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

  async function initSiteToggle() {
    if (!siteToggle || !siteToggleRow || !currentSiteDisplay) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          currentRootDomain = getRootDomain(url.hostname);
          currentSiteKeys = getSiteKeys(url.hostname);
          currentSiteDisplay.textContent = currentRootDomain;
          siteToggleRow.style.display = '';

          const stored = await chrome.storage.sync.get({ disabledSites: [] });
          disabledSites = normalizeDisabledSites(stored.disabledSites);
          siteToggle.checked = !disabledSites.some(site => currentSiteKeys.includes(site));
        } else {
          siteToggleRow.style.display = 'none';
        }
      } else {
        siteToggleRow.style.display = 'none';
      }
    } catch (error) {
      console.error('Failed to init site toggle:', error);
      siteToggleRow.style.display = 'none';
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
      allCurrencies = currencies;

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
      const availableCodes = getOrderedFiatCodes(currencies).map(code => code.toUpperCase());
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

      populateCurrencySelect(targetCurrency, currencies, savedTarget, false);
      populateCurrencySelect(fromCurrency, currencies, savedFrom, true);
      populateTargetCurrencyDropdown(currencies, savedTarget);

      resultCurrency.textContent = savedTarget;
      doQuickConvert();
    } catch (error) {
      console.error('Failed to initialize currencies:', error);
      setCurrenciesUnavailable();
    }
  }

  function setCurrenciesUnavailable() {
    currenciesLoadFailed = true;
    targetCurrencyBtn.disabled = true;
    fromCurrency.disabled = true;
    fromCurrency.textContent = '';
    const unavailableOption = document.createElement('option');
    unavailableOption.value = '';
    unavailableOption.textContent = 'Unavailable';
    fromCurrency.appendChild(unavailableOption);
    swapBtn.disabled = true;
    targetCurrencyBtn.setAttribute('aria-disabled', 'true');
    targetCurrencyDisplay.textContent = 'Unavailable';
    resultCurrency.textContent = '--';
    convertResult.querySelector('.result-amount').textContent = 'Error';
    statusDot.classList.remove('success');
    statusDot.classList.add('error');
    statusText.textContent = 'Failed to load currency list';
  }
  
  function populateTargetCurrencyDropdown(currencies, selectedValue) {
    targetCurrencyList.textContent = '';
    const orderedCodes = getOrderedFiatCodes(currencies);

    for (const code of orderedCodes) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = code.toUpperCase();
      item.id = `target-currency-option-${code.toLowerCase()}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(code.toUpperCase() === selectedValue));
      item.tabIndex = -1;
      const flag = getFlag(code);
      const name = currencies[code] || code.toUpperCase();
      item.dataset.search = `${code.toUpperCase()} ${name}`.toLowerCase();
      item.textContent = `${flag} ${code.toUpperCase()} - ${name}`;
      
      if (code.toUpperCase() === selectedValue) {
        item.classList.add('selected');
        targetCurrencyDisplay.textContent = `${flag} ${code.toUpperCase()} - ${name}`;
        setActiveOption(targetCurrencyBtn, item);
      }
      
      item.addEventListener('click', () => {
        selectTargetCurrency(code.toUpperCase(), `${flag} ${code.toUpperCase()} - ${name}`);
      });
      
      targetCurrencyList.appendChild(item);
    }

    filterTargetCurrencyDropdown(targetCurrencySearch?.value || '');
  }

  function filterTargetCurrencyDropdown(query) {
    const normalizedQuery = (query || '').trim().toLowerCase();
    let visibleCount = 0;
    const totalItems = targetCurrencyList.querySelectorAll('.dropdown-item').length;

    targetCurrencyList.querySelectorAll('.dropdown-item').forEach(item => {
      const matches = !normalizedQuery || item.dataset.search.includes(normalizedQuery);
      item.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    if (targetCurrencyNoResults) {
      targetCurrencyNoResults.classList.toggle('visible', totalItems > 0 && visibleCount === 0);
    }
  }

  function getFirstVisibleTargetCurrencyItem() {
    return Array.from(targetCurrencyList.querySelectorAll('.dropdown-item')).find(item => item.style.display !== 'none') || null;
  }

  function getVisibleCurrencyItems(list) {
    return Array.from(list.querySelectorAll('.dropdown-item')).filter(item => item.style.display !== 'none');
  }

  function setActiveOption(button, item) {
    if (!item) {
      button.removeAttribute('aria-activedescendant');
      targetCurrencySearch?.removeAttribute('aria-activedescendant');
      return;
    }
    button.setAttribute('aria-activedescendant', item.id);
    targetCurrencySearch?.setAttribute('aria-activedescendant', item.id);
  }

  function focusCurrencyItem(list, button, item) {
    if (!item) return;
    list.querySelectorAll('.dropdown-item').forEach(option => {
      option.tabIndex = option === item ? 0 : -1;
    });
    setActiveOption(button, item);
    item.focus();
    item.scrollIntoView({ block: 'nearest' });
  }

  function focusInitialCurrencyItem(list, button, useLast = false) {
    const visibleItems = getVisibleCurrencyItems(list);
    const selectedItem = visibleItems.find(item => item.getAttribute('aria-selected') === 'true');
    focusCurrencyItem(list, button, selectedItem || (useLast ? visibleItems.at(-1) : visibleItems[0]));
  }

  function moveCurrencyFocus(list, button, direction) {
    const visibleItems = getVisibleCurrencyItems(list);
    if (visibleItems.length === 0) return;

    const activeIndex = visibleItems.indexOf(document.activeElement);
    const currentIndex = activeIndex >= 0
      ? activeIndex
      : visibleItems.findIndex(item => item.id === button.getAttribute('aria-activedescendant'));
    const nextIndex = currentIndex >= 0
      ? (currentIndex + direction + visibleItems.length) % visibleItems.length
      : (direction > 0 ? 0 : visibleItems.length - 1);
    focusCurrencyItem(list, button, visibleItems[nextIndex]);
  }

  function updateSelectedOption(list, button, value) {
    list.querySelectorAll('.dropdown-item').forEach(item => {
      const isSelected = item.dataset.value === value;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
      if (isSelected) setActiveOption(button, item);
    });
  }

  function handleCurrencyListKeydown(event, list, button, closeDropdown) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveCurrencyFocus(list, button, event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && document.activeElement?.classList.contains('dropdown-item')) {
      event.preventDefault();
      document.activeElement.click();
      button.focus();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      button.focus();
    }
  }

  function resetTargetCurrencySearch() {
    if (targetCurrencySearch) {
      targetCurrencySearch.value = '';
    }
    filterTargetCurrencyDropdown('');
  }
  
  function selectTargetCurrency(value, display) {
    // Update hidden select for compatibility
    targetCurrency.value = value;
    
    // Update display
    targetCurrencyDisplay.textContent = display;
    resultCurrency.textContent = value;
    
    // Update selected state
    updateSelectedOption(targetCurrencyList, targetCurrencyBtn, value);
    
    // Close dropdown
    closeTargetDropdown();
    
    // Save and convert
    persistCurrencySelection({ targetCurrency: value });
    doQuickConvert();
  }
  
  function toggleTargetDropdown() {
    const isOpen = !targetCurrencyDropdown.classList.contains('hidden');
    if (isOpen) {
      closeTargetDropdown();
    } else {
      openTargetDropdown();
    }
  }
  
  function openTargetDropdown() {
    if (targetCurrencyBtn.disabled) return;
    targetCurrencyDropdown.classList.remove('hidden');
    targetCurrencyWrapper.classList.add('open');
    targetCurrencyBtn.setAttribute('aria-expanded', 'true');
    if (targetCurrencySearch) targetCurrencySearch.setAttribute('aria-expanded', 'true');
    if (targetSection) {
      targetSection.classList.add('dropdown-open');
    }
    resetTargetCurrencySearch();
    if (targetCurrencySearch) {
      targetCurrencySearch.focus();
    }
  }
  
  function closeTargetDropdown() {
    targetCurrencyDropdown.classList.add('hidden');
    targetCurrencyWrapper.classList.remove('open');
    targetCurrencyBtn.setAttribute('aria-expanded', 'false');
    if (targetCurrencySearch) targetCurrencySearch.setAttribute('aria-expanded', 'false');
    if (targetSection) {
      targetSection.classList.remove('dropdown-open');
    }
    resetTargetCurrencySearch();
  }
  
  targetCurrencyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTargetDropdown();
  });

  targetCurrencyBtn.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (targetCurrencyDropdown.classList.contains('hidden')) openTargetDropdown();
      focusInitialCurrencyItem(targetCurrencyList, targetCurrencyBtn, event.key === 'ArrowUp');
    } else if (event.key === 'Escape' && !targetCurrencyDropdown.classList.contains('hidden')) {
      event.preventDefault();
      closeTargetDropdown();
    }
  });

  targetCurrencyList.addEventListener('keydown', (event) => {
    handleCurrencyListKeydown(event, targetCurrencyList, targetCurrencyBtn, closeTargetDropdown);
  });

  if (targetCurrencySearch) {
    targetCurrencySearch.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    targetCurrencySearch.addEventListener('input', () => {
      filterTargetCurrencyDropdown(targetCurrencySearch.value);
      setActiveOption(targetCurrencyBtn, getFirstVisibleTargetCurrencyItem());
    });

    targetCurrencySearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTargetDropdown();
        targetCurrencyBtn.focus();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = document.getElementById(targetCurrencyBtn.getAttribute('aria-activedescendant'));
        const itemToSelect = activeItem && activeItem.style.display !== 'none'
          ? activeItem
          : getFirstVisibleTargetCurrencyItem();
        if (itemToSelect) {
          itemToSelect.click();
          targetCurrencyBtn.focus();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const visibleItems = getVisibleCurrencyItems(targetCurrencyList);
        focusCurrencyItem(
          targetCurrencyList,
          targetCurrencyBtn,
          e.key === 'ArrowDown' ? visibleItems[0] : visibleItems.at(-1)
        );
      }
    });
  }
  
  document.addEventListener('click', (e) => {
    if (!targetCurrencyWrapper.contains(e.target)) {
      closeTargetDropdown();
    }
  });
  
  const currenciesReady = initCurrencies();

  initSiteToggle();
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
    if (result.lastFetch) {
      const lastUpdate = new Date(result.lastFetch);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastUpdate) / 60000);

      statusDot.classList.add('success');
      if (diffMinutes < 1) {
        statusText.textContent = 'Rates updated just now';
      } else if (diffMinutes < 60) {
        statusText.textContent = `Rates updated ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        statusText.textContent = `Rates updated ${diffHours}h ago`;
      }
    } else {
      chrome.runtime.sendMessage({ type: 'getRates' }, (response) => {
        if (response?.success) {
          statusDot.classList.add('success');
          statusText.textContent = 'Rates loaded successfully';
        } else {
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
 

  if (siteToggle) {
    siteToggle.addEventListener('change', async () => {
      if (!currentRootDomain) return;
      const stored = await chrome.storage.sync.get({ disabledSites: [] });
      disabledSites = normalizeDisabledSites(stored.disabledSites);
      if (siteToggle.checked) {
        disabledSites = disabledSites.filter(site => !currentSiteKeys.includes(site));
      } else {
        if (!disabledSites.includes(currentRootDomain)) {
          disabledSites.push(currentRootDomain);
        }
      }
      await chrome.storage.sync.set({ disabledSites });
    });
  }
 
  fromAmount.addEventListener('input', doQuickConvert);
  fromCurrency.addEventListener('change', () => {
    persistCurrencySelection({ fromCurrency: fromCurrency.value });
    doQuickConvert();
  });

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
    const currentFrom = fromCurrency.value;
    const currentTo = targetCurrency.value;
    
    if (currentFrom && currentTo && allCurrencies) {
      fromCurrency.value = currentTo;
      targetCurrency.value = currentFrom;
      resultCurrency.textContent = currentFrom;
      
      const toFlag = getFlag(currentFrom);
      const toName = allCurrencies[currentFrom.toLowerCase()] || currentFrom;
      targetCurrencyDisplay.textContent = `${toFlag} ${currentFrom} - ${toName}`;
      updateSelectedOption(targetCurrencyList, targetCurrencyBtn, currentFrom);
      
      persistCurrencySelection({
        targetCurrency: currentFrom,
        fromCurrency: currentTo
      });
      doQuickConvert();
    }
  });

  function doQuickConvert() {
    const amount = parseFloat(fromAmount.value);
    if (isNaN(amount) || amount <= 0) {
      convertResult.querySelector('.result-amount').textContent = '--';
      return;
    }
 
    chrome.runtime.sendMessage({
      type: 'convert',
      amount: amount,
      fromCurrency: fromCurrency.value,
      toCurrency: targetCurrency.value
    }, (response) => {
      if (response?.success) {
        const formatted = response.converted.toLocaleString(undefined, {
          minimumFractionDigits: currentDecimalPlaces,
          maximumFractionDigits: currentDecimalPlaces
        });
        convertResult.querySelector('.result-amount').textContent = formatted;
      } else {
        convertResult.querySelector('.result-amount').textContent = 'Error';
      }
    });
  }
});
