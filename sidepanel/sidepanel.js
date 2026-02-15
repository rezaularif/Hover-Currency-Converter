const CURRENCY_SYMBOLS = {
  AED: '🇦🇪', AFN: '🇦🇫', ALL: '🇦🇱', AMD: '🇦🇲', ANG: '🇦🇼',
  AOA: '🇦🇴', ARS: '🇦🇷', AUD: '🇦🇺', AWG: '🇦🇼', AZN: '🇦🇿',
  BAM: '🇧🇦', BBD: '🇧🇧', BDT: '🇧🇩', BGN: '🇧🇬', BHD: '🇧🇭',
  BIF: '🇧🇮', BMD: '🇧🇲', BND: '🇧🇳', BOB: '🇧🇴', BRL: '🇧🇷',
  BSD: '🇧🇸', BTN: '🇧🇹', BWP: '🇧🇼', BYN: '🇧🇾', BZD: '🇧🇿',
  CAD: '🇨🇦', CDF: '🇨🇩', CHF: '🇨🇭', CLP: '🇨🇱', CNY: '🇨🇳',
  COP: '🇨🇴', CRC: '🇨🇷', CUP: '🇨🇺', CVE: '🇨🇻', CZK: '🇨🇿',
  DJF: '🇩🇯', DKK: '🇩🇰', DOP: '🇩🇴', DZD: '🇩🇿', EGP: '🇪🇬',
  ERN: '🇪🇷', ETB: '🇪🇹', EUR: '🇪🇺', FJD: '🇫🇯', FKP: '🇫🇰',
  GBP: '🇬🇧', GEL: '🇬🇪', GHS: '🇬🇭', GIP: '🇬🇮', GMD: '🇬🇲',
  GNF: '🇬🇳', GTQ: '🇬🇹', GYD: '🇬🇾', HKD: '🇭🇰', HNL: '🇭🇳',
  HRK: '🇭🇷', HTG: '🇭🇹', HUF: '🇭🇺', IDR: '🇮🇩', ILS: '🇮🇱',
  INR: '🇮🇳', IQD: '🇮🇶', IRR: '🇮🇷', ISK: '🇮🇸', JMD: '🇯🇲',
  JOD: '🇯🇴', JPY: '🇯🇵', KES: '🇰🇪', KGS: '🇰🇬', KHR: '🇰🇭',
  KMF: '🇰🇲', KPW: '🇰🇵', KRW: '🇰🇷', KWD: '🇰🇼', KYD: '🇰🇾', KZT: '🇰🇿',
  LAK: '🇱🇦', LBP: '🇱🇧', LKR: '🇱🇰', LRD: '🇱🇷', LSL: '🇱🇸',
  LYD: '🇱🇾', MAD: '🇲🇦', MDL: '🇲🇩', MGA: '🇲🇬', MKD: '🇲🇰',
  MMK: '🇲🇲', MNT: '🇲🇳', MOP: '🇲🇴', MRU: '🇲🇷', MUR: '🇲🇺',
  MVR: '🇲🇻', MWK: '🇲🇼', MXN: '🇲🇽', MYR: '🇲🇾', MZN: '🇲🇿',
  NAD: '🇳🇦', NGN: '🇳🇬', NIO: '🇳🇮', NOK: '🇳🇴', NPR: '🇳🇵',
  NZD: '🇳🇿', OMR: '🇴🇲', PAB: '🇵🇦', PEN: '🇵🇪', PGK: '🇵🇬',
  PHP: '🇵🇭', PKR: '🇵🇰', PLN: '🇵🇱', PYG: '🇵🇾', QAR: '🇶🇦',
  RON: '🇷🇴', RSD: '🇷🇸', RUB: '🇷🇺', RWF: '🇷🇼', SAR: '🇸🇦',
  SBD: '🇸🇧', SCR: '🇸🇨', SDG: '🇸🇩', SEK: '🇸🇪', SGD: '🇸🇬',
  SHP: '🇸🇭', SLE: '🇸🇱', SLL: '🇸🇱', SOS: '🇸🇴', SRD: '🇸🇷',
  SSP: '🇸🇸', STD: '🇸🇹', STN: '🇸🇹', SYP: '🇸🇾', SZL: '🇸🇿',
  THB: '🇹🇭', TJS: '🇹🇯', TMT: '🇹🇲', TND: '🇹🇳', TOP: '🇹🇴',
  TRY: '🇹🇷', TTD: '🇹🇹', TWD: '🇹🇼', TZS: '🇹🇿', UAH: '🇺🇦',
  UGX: '🇺🇬', USD: '🇺🇸', UYU: '🇺🇾', UZS: '🇺🇿',
  VES: '🇻🇪', VND: '🇻🇳', VUV: '🇻🇺', WST: '🇼🇸',
  XAF: '🇨🇲', XCD: '🇦🇨', XDR: '🌐', XOF: '🇧🇯', XPF: '🇵🇫',
  YER: '🇾🇪', ZAR: '🇿🇦', ZMW: '🇿🇲', ZWL: '🇿🇼'
};

const KNOWN_FIAT_CODES = new Set([
  'aed', 'afn', 'all', 'amd', 'ang', 'aoa', 'ars', 'aud', 'awg', 'azn',
  'bam', 'bbd', 'bdt', 'bgn', 'bhd', 'bif', 'bmd', 'bnd', 'bob', 'brl',
  'bsd', 'btn', 'bwp', 'byn', 'bzd', 'cad', 'cdf', 'chf', 'clp', 'cny',
  'cop', 'crc', 'cup', 'cve', 'czk', 'djf', 'dkk', 'dop', 'dzd', 'egp',
  'ern', 'etb', 'eur', 'fjd', 'fkp', 'gbp', 'gel', 'ghs', 'gip', 'gmd',
  'gnf', 'gtq', 'gyd', 'hkd', 'hnl', 'hrk', 'htg', 'huf', 'idr', 'ils',
  'inr', 'iqd', 'irr', 'isk', 'jmd', 'jod', 'jpy', 'kes', 'kgs', 'khr',
  'kmf', 'kpw', 'krw', 'kwd', 'kyd', 'kzt', 'lak', 'lbp', 'lkr', 'lrd',
  'lsl', 'lyd', 'mad', 'mdl', 'mga', 'mkd', 'mmk', 'mnt', 'mop', 'mru',
  'mur', 'mvr', 'mwk', 'mxn', 'myr', 'mzn', 'nad', 'ngn', 'nio', 'nok',
  'npr', 'nzd', 'omr', 'pab', 'pen', 'pgk', 'php', 'pkr', 'pln', 'pyg',
  'qar', 'ron', 'rsd', 'rub', 'rwf', 'sar', 'sbd', 'scr', 'sdg', 'sek',
  'sgd', 'shp', 'sle', 'sll', 'sos', 'srd', 'ssp', 'std', 'stn', 'syp',
  'szl', 'thb', 'tjs', 'tmt', 'tnd', 'top', 'try', 'ttd', 'twd', 'tzs',
  'uah', 'ugx', 'usd', 'uyu', 'uzs', 'ves', 'vnd', 'vuv', 'wst', 'xaf',
  'xcd', 'xof', 'xpf', 'yer', 'zar', 'zmw', 'zwl', 'cnh', 'cuc',
  'ggp', 'imp', 'jep', 'svc', 'tvd'
]);

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
const DEFAULT_TARGET_CURRENCY = 'EUR';
const DEFAULT_FROM_CURRENCY = 'USD';
const DEFAULT_RESULT_GRADIENT = 'purple-orange';
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

let allCurrencies = null;
async function fetchCurrencies() {
  const now = Date.now();
  const cached = await chrome.storage.local.get({
    currenciesList: null,
    currenciesListFetchedAt: 0
  });

  try {
    if (
      cached.currenciesList &&
      cached.currenciesListFetchedAt &&
      (now - cached.currenciesListFetchedAt) < CURRENCIES_CACHE_DURATION
    ) {
      return cached.currenciesList;
    }

    const response = await fetch(CURRENCIES_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
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
  if (CURRENCY_SYMBOLS[upperCode]) {
    return CURRENCY_SYMBOLS[upperCode];
  }
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
  if (KNOWN_FIAT_CODES.has(codeLower)) return true;
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

function normalizeCurrencyCode(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
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
  selectElement.innerHTML = '';
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

  // Custom dropdown elements
  const fromCurrencyBtn = document.getElementById('fromCurrencyBtn');
  const fromCurrencyDisplay = document.getElementById('fromCurrencyDisplay');
  const fromCurrencyDropdown = document.getElementById('fromCurrencyDropdown');
  const fromCurrencyList = document.getElementById('fromCurrencyList');
  const fromCurrencyWrapper = document.querySelector('.converter-row .custom-select-wrapper');
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
  fromCurrencyBtn.setAttribute('aria-expanded', 'false');
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
          disabledSites = stored.disabledSites;
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
    const currencies = await fetchCurrencies();
    if (!currencies) {
      currenciesLoadFailed = true;
      targetCurrencyBtn.disabled = true;
      fromCurrencyBtn.disabled = true;
      swapBtn.disabled = true;
      targetCurrencyBtn.setAttribute('aria-disabled', 'true');
      fromCurrencyBtn.setAttribute('aria-disabled', 'true');
      targetCurrencyDisplay.textContent = 'Unavailable';
      fromCurrencyDisplay.textContent = 'Unavailable';
      resultCurrency.textContent = '--';
      convertResult.querySelector('.result-amount').textContent = 'Error';
      statusDot.classList.remove('success');
      statusDot.classList.add('error');
      statusText.textContent = 'Failed to load currency list';
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

    const syncTarget = normalizeCurrencyCode(syncSaved.targetCurrency);
    const syncFrom = normalizeCurrencyCode(syncSaved.fromCurrency);
    const localTarget = normalizeCurrencyCode(localSaved.targetCurrencyBackup);
    const localFrom = normalizeCurrencyCode(localSaved.fromCurrencyBackup);

    const resolvedTarget = syncTarget || localTarget || DEFAULT_TARGET_CURRENCY;
    const resolvedFrom = syncFrom || localFrom || DEFAULT_FROM_CURRENCY;
    const availableCodes = getOrderedFiatCodes(currencies).map(code => code.toUpperCase());
    const availableSet = new Set(availableCodes);
    const firstAvailableCode = availableCodes[0] || DEFAULT_TARGET_CURRENCY;

    const savedTarget = availableSet.has(resolvedTarget)
      ? resolvedTarget
      : (availableSet.has(DEFAULT_TARGET_CURRENCY) ? DEFAULT_TARGET_CURRENCY : firstAvailableCode);
    const savedFrom = availableSet.has(resolvedFrom)
      ? resolvedFrom
      : (availableSet.has(DEFAULT_FROM_CURRENCY) ? DEFAULT_FROM_CURRENCY : firstAvailableCode);

    // Self-heal storage when sync keys are missing/invalid.
    if (
      !syncTarget || !syncFrom ||
      localTarget !== savedTarget || localFrom !== savedFrom ||
      resolvedTarget !== savedTarget || resolvedFrom !== savedFrom
    ) {
      persistCurrencySelection({
        targetCurrency: savedTarget,
        fromCurrency: savedFrom
      });
    }
    
    populateCurrencySelect(targetCurrency, currencies, savedTarget, false);
    populateCurrencySelect(fromCurrency, currencies, savedFrom, true);
    
    // Populate custom dropdowns
    populateFromCurrencyDropdown(currencies, savedFrom);
    populateTargetCurrencyDropdown(currencies, savedTarget);
    
    resultCurrency.textContent = savedTarget;
    doQuickConvert();
  }
  
  function populateFromCurrencyDropdown(currencies, selectedValue) {
    fromCurrencyList.innerHTML = '';
    const orderedCodes = getOrderedFiatCodes(currencies);

    for (const code of orderedCodes) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = code.toUpperCase();
      const flag = getFlag(code);
      item.textContent = `${flag} ${code.toUpperCase()}`;
      
      if (code.toUpperCase() === selectedValue) {
        item.classList.add('selected');
        fromCurrencyDisplay.textContent = `${flag} ${code.toUpperCase()}`;
      }
      
      item.addEventListener('click', () => {
        selectFromCurrency(code.toUpperCase(), `${flag} ${code.toUpperCase()}`);
      });
      
      fromCurrencyList.appendChild(item);
    }
  }
  
  function populateTargetCurrencyDropdown(currencies, selectedValue) {
    targetCurrencyList.innerHTML = '';
    const orderedCodes = getOrderedFiatCodes(currencies);

    for (const code of orderedCodes) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = code.toUpperCase();
      const flag = getFlag(code);
      const name = currencies[code] || code.toUpperCase();
      item.dataset.search = `${code.toUpperCase()} ${name}`.toLowerCase();
      item.textContent = `${flag} ${code.toUpperCase()} - ${name}`;
      
      if (code.toUpperCase() === selectedValue) {
        item.classList.add('selected');
        targetCurrencyDisplay.textContent = `${flag} ${code.toUpperCase()} - ${name}`;
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

  function resetTargetCurrencySearch() {
    if (targetCurrencySearch) {
      targetCurrencySearch.value = '';
    }
    filterTargetCurrencyDropdown('');
  }
  
  function selectFromCurrency(value, display) {
    // Update hidden select for compatibility
    fromCurrency.value = value;
    
    // Update display
    fromCurrencyDisplay.textContent = display;
    
    // Update selected state
    fromCurrencyList.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.value === value);
    });
    
    // Close dropdown
    closeFromDropdown();
    
    // Save and convert
    persistCurrencySelection({ fromCurrency: value });
    doQuickConvert();
  }
  
  function selectTargetCurrency(value, display) {
    // Update hidden select for compatibility
    targetCurrency.value = value;
    
    // Update display
    targetCurrencyDisplay.textContent = display;
    resultCurrency.textContent = value;
    
    // Update selected state
    targetCurrencyList.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.value === value);
    });
    
    // Close dropdown
    closeTargetDropdown();
    
    // Save and convert
    persistCurrencySelection({ targetCurrency: value });
    doQuickConvert();
  }
  
  function toggleFromDropdown() {
    const isOpen = !fromCurrencyDropdown.classList.contains('hidden');
    if (isOpen) {
      closeFromDropdown();
    } else {
      openFromDropdown();
    }
  }
  
  function toggleTargetDropdown() {
    const isOpen = !targetCurrencyDropdown.classList.contains('hidden');
    if (isOpen) {
      closeTargetDropdown();
    } else {
      openTargetDropdown();
    }
  }
  
  function openFromDropdown() {
    if (fromCurrencyBtn.disabled) return;
    closeTargetDropdown();
    fromCurrencyDropdown.classList.remove('hidden');
    fromCurrencyWrapper.classList.add('open');
    fromCurrencyBtn.setAttribute('aria-expanded', 'true');
    if (converterSection) {
      converterSection.classList.add('dropdown-open');
    }
  }
  
  function closeFromDropdown() {
    fromCurrencyDropdown.classList.add('hidden');
    fromCurrencyWrapper.classList.remove('open');
    fromCurrencyBtn.setAttribute('aria-expanded', 'false');
    if (converterSection) {
      converterSection.classList.remove('dropdown-open');
    }
  }
  
  function openTargetDropdown() {
    if (targetCurrencyBtn.disabled) return;
    closeFromDropdown();
    targetCurrencyDropdown.classList.remove('hidden');
    targetCurrencyWrapper.classList.add('open');
    targetCurrencyBtn.setAttribute('aria-expanded', 'true');
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
    if (targetSection) {
      targetSection.classList.remove('dropdown-open');
    }
    resetTargetCurrencySearch();
  }
  
  // Custom dropdown event listeners
  fromCurrencyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFromDropdown();
  });
  
  targetCurrencyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTargetDropdown();
  });

  if (targetCurrencySearch) {
    targetCurrencySearch.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    targetCurrencySearch.addEventListener('input', () => {
      filterTargetCurrencyDropdown(targetCurrencySearch.value);
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
        const firstVisibleItem = getFirstVisibleTargetCurrencyItem();
        if (firstVisibleItem) {
          firstVisibleItem.click();
        }
      }
    });
  }
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!fromCurrencyWrapper.contains(e.target)) {
      closeFromDropdown();
    }
    if (!targetCurrencyWrapper.contains(e.target)) {
      closeTargetDropdown();
    }
  });
  
  initCurrencies();

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
  }, (result) => {
    // User preferences
    currentDecimalPlaces = result.decimalPlaces;
    decimalPlacesSelect.value = currentDecimalPlaces;
    tooltipPositionSelect.value = result.tooltipPosition;
    tooltipThemeSelect.value = result.tooltipTheme;

    // Apply result gradient
    const savedGradient = VALID_RESULT_GRADIENTS.has(result.resultGradient)
      ? result.resultGradient
      : DEFAULT_RESULT_GRADIENT;
    resultGradientSelect.value = savedGradient;
    applyResultGradient(savedGradient);
    if (savedGradient !== result.resultGradient) {
      chrome.storage.local.set({ resultGradient: savedGradient });
    }

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
      disabledSites = stored.disabledSites;
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
    // Remove all gradient classes from result box
    convertResult.classList.remove(
      'result-gradient-purple-orange',
      'result-gradient-ocean-blue',
      'result-gradient-sunset',
      'result-gradient-forest',
      'result-gradient-golden',
      'result-gradient-purple-pink',
      'result-gradient-blue-cyan',
      'result-gradient-red-orange',
      'result-gradient-teal-green',
      'result-gradient-aurora',
      'result-gradient-ember',
      'result-gradient-midnight',
      'result-gradient-berry',
      'result-gradient-aqua-lime',
      'result-gradient-rose-gold',
      'result-gradient-cobalt-cyan',
      'result-gradient-graphite'
    );
    // Add the selected gradient class to result box
    convertResult.classList.add(`result-gradient-${normalizedGradient}`);
    
    // Remove all border gradient classes from converter section
    converterSection.classList.remove(
      'border-gradient-purple-orange',
      'border-gradient-ocean-blue',
      'border-gradient-sunset',
      'border-gradient-forest',
      'border-gradient-golden',
      'border-gradient-purple-pink',
      'border-gradient-blue-cyan',
      'border-gradient-red-orange',
      'border-gradient-teal-green',
      'border-gradient-aurora',
      'border-gradient-ember',
      'border-gradient-midnight',
      'border-gradient-berry',
      'border-gradient-aqua-lime',
      'border-gradient-rose-gold',
      'border-gradient-cobalt-cyan',
      'border-gradient-graphite'
    );
    // Add the matching border gradient class to converter section
    converterSection.classList.add(`border-gradient-${normalizedGradient}`);
  }

  // Swap button functionality
  swapBtn.addEventListener('click', () => {
    const currentFrom = fromCurrency.value;
    const currentTo = targetCurrency.value;
    
    if (currentFrom && currentTo && allCurrencies) {
      fromCurrency.value = currentTo;
      targetCurrency.value = currentFrom;
      resultCurrency.textContent = currentFrom;
      
      // Update from currency custom dropdown display
      const fromFlag = getFlag(currentTo);
      fromCurrencyDisplay.textContent = `${fromFlag} ${currentTo}`;
      fromCurrencyList.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.value === currentTo);
      });
      
      // Update target currency custom dropdown display
      const toFlag = getFlag(currentFrom);
      const toName = allCurrencies[currentFrom.toLowerCase()] || currentFrom;
      targetCurrencyDisplay.textContent = `${toFlag} ${currentFrom} - ${toName}`;
      targetCurrencyList.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.value === currentFrom);
      });
      
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
