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

const FIAT_CURRENCIES = new Set([
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
  'xcd', 'xdr', 'xof', 'xpf', 'yer', 'zar', 'zmw', 'zwl', 'cnh', 'cuc',
  'ggp', 'imp', 'jep', 'svc', 'tvd', 'xag', 'xau', 'xpd', 'xpt'
]);

// Common cryptocurrency codes to exclude
const CRYPTO_CURRENCIES = new Set([
  'btc', 'eth', 'ltc', 'xrp', 'bch', 'bnb', 'usdt', 'usdc', 'doge', 'ada',
  'dot', 'sol', 'matic', 'avax', 'link', 'uni', 'atom', 'xlm', 'etc', 'trx',
  'xmr', 'eos', 'aave', 'mkr', 'comp', 'yfi', 'sushi', 'snx', 'crv', '1inch'
]);

const CURRENCIES_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';

let allCurrencies = null;
async function fetchCurrencies() {
  try {
    const cached = await chrome.storage.local.get('currenciesList');
    if (cached.currenciesList) {
      return cached.currenciesList;
    }
    const response = await fetch(CURRENCIES_API_URL);
    const data = await response.json();
    await chrome.storage.local.set({ currenciesList: data });
    return data;
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    return null;
  }
}

function getFlag(code) {
  const upperCode = code.toUpperCase();
  return CURRENCY_SYMBOLS[upperCode] || '💱';
}

const POPULAR_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'cny', 'inr', 'cad', 'aud', 'chf', 'krw'];

function populateCurrencySelect(selectElement, currencies, selectedValue, isSmall = false) {
  selectElement.innerHTML = '';
  
  // Get all valid fiat currency codes (exclude cryptocurrencies)
  const allCodes = Object.keys(currencies).filter(code => {
    const codeLower = code.toLowerCase();
    return currencies[code] && 
           typeof currencies[code] === 'string' &&
           FIAT_CURRENCIES.has(codeLower) &&
           !CRYPTO_CURRENCIES.has(codeLower);
  });
  
  // Put popular currencies first, then the rest alphabetically
  const popular = POPULAR_CURRENCIES.filter(code => allCodes.includes(code));
  const others = allCodes.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();
  const orderedCodes = [...popular, ...others];
  
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
  const targetCurrencyWrapper = document.querySelector('.custom-select-full');
  const targetSection = targetCurrencyWrapper.closest('.section');

  // Fetch currencies and populate dropdowns
  async function initCurrencies() {
    const currencies = await fetchCurrencies();
    if (currencies) {
      allCurrencies = currencies;
      
      // Get saved values first
      const saved = await chrome.storage.sync.get(['targetCurrency', 'fromCurrency']);
      const savedTarget = saved.targetCurrency || 'EUR';
      const savedFrom = saved.fromCurrency || 'USD';
      
      populateCurrencySelect(targetCurrency, currencies, savedTarget, false);
      populateCurrencySelect(fromCurrency, currencies, savedFrom, true);
      
      // Populate custom dropdowns
      populateFromCurrencyDropdown(currencies, savedFrom);
      populateTargetCurrencyDropdown(currencies, savedTarget);
      
      resultCurrency.textContent = savedTarget;
      
      // Setup dropdown size handlers after populating
      setupDropdownHandlers();
      
      doQuickConvert();
    }
  }
  
  function populateFromCurrencyDropdown(currencies, selectedValue) {
    fromCurrencyList.innerHTML = '';
    
    // Get all valid fiat currency codes (exclude cryptocurrencies)
    const allCodes = Object.keys(currencies).filter(code => {
      const codeLower = code.toLowerCase();
      return currencies[code] && 
             typeof currencies[code] === 'string' &&
             FIAT_CURRENCIES.has(codeLower) &&
             !CRYPTO_CURRENCIES.has(codeLower);
    });
    
    const popular = POPULAR_CURRENCIES.filter(code => allCodes.includes(code));
    const others = allCodes.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();
    const orderedCodes = [...popular, ...others];
    
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
    
    // Get all valid fiat currency codes (exclude cryptocurrencies)
    const allCodes = Object.keys(currencies).filter(code => {
      const codeLower = code.toLowerCase();
      return currencies[code] && 
             typeof currencies[code] === 'string' &&
             FIAT_CURRENCIES.has(codeLower) &&
             !CRYPTO_CURRENCIES.has(codeLower);
    });
    
    const popular = POPULAR_CURRENCIES.filter(code => allCodes.includes(code));
    const others = allCodes.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();
    const orderedCodes = [...popular, ...others];
    
    for (const code of orderedCodes) {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.dataset.value = code.toUpperCase();
      const flag = getFlag(code);
      const name = currencies[code] || code.toUpperCase();
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
    chrome.storage.sync.set({ fromCurrency: value });
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
    chrome.storage.sync.set({ targetCurrency: value });
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
    closeTargetDropdown();
    fromCurrencyDropdown.classList.remove('hidden');
    fromCurrencyWrapper.classList.add('open');
    if (converterSection) {
      converterSection.classList.add('dropdown-open');
    }
  }
  
  function closeFromDropdown() {
    fromCurrencyDropdown.classList.add('hidden');
    fromCurrencyWrapper.classList.remove('open');
    if (converterSection) {
      converterSection.classList.remove('dropdown-open');
    }
  }
  
  function openTargetDropdown() {
    closeFromDropdown();
    targetCurrencyDropdown.classList.remove('hidden');
    targetCurrencyWrapper.classList.add('open');
    if (targetSection) {
      targetSection.classList.add('dropdown-open');
    }
  }
  
  function closeTargetDropdown() {
    targetCurrencyDropdown.classList.add('hidden');
    targetCurrencyWrapper.classList.remove('open');
    if (targetSection) {
      targetSection.classList.remove('dropdown-open');
    }
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
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!fromCurrencyWrapper.contains(e.target)) {
      closeFromDropdown();
    }
    if (!targetCurrencyWrapper.contains(e.target)) {
      closeTargetDropdown();
    }
  });
  
  function setupDropdownHandlers() {
    // No longer needed for native selects since we use custom dropdowns
  }
  
  initCurrencies();

  // Load saved settings
  chrome.storage.sync.get(['enabled'], (result) => {
    enableToggle.checked = result.enabled !== false;
  });

  // Load all local storage data in one call
  chrome.storage.local.get(['decimalPlaces', 'tooltipPosition', 'tooltipTheme', 'resultGradient', 'lastFetch'], (result) => {
    // User preferences
    currentDecimalPlaces = result.decimalPlaces ?? 2;
    decimalPlacesSelect.value = currentDecimalPlaces;
    tooltipPositionSelect.value = result.tooltipPosition ?? 'below';
    tooltipThemeSelect.value = result.tooltipTheme ?? 'purple-gradient';
    
    // Apply result gradient
    const savedGradient = result.resultGradient ?? 'purple-orange';
    resultGradientSelect.value = savedGradient;
    applyResultGradient(savedGradient);

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
 
  targetCurrency.addEventListener('change', () => {
    chrome.storage.sync.set({ targetCurrency: targetCurrency.value });
    resultCurrency.textContent = targetCurrency.value;
    doQuickConvert();
  });
 
  fromAmount.addEventListener('input', doQuickConvert);
  
  fromCurrency.addEventListener('change', () => {
    chrome.storage.sync.set({ fromCurrency: fromCurrency.value });
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
    const gradient = resultGradientSelect.value;
    chrome.storage.local.set({ resultGradient: gradient });
    applyResultGradient(gradient);
  });

  function applyResultGradient(gradient) {
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
      'result-gradient-teal-green'
    );
    // Add the selected gradient class to result box
    convertResult.classList.add(`result-gradient-${gradient}`);
    
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
      'border-gradient-teal-green'
    );
    // Add the matching border gradient class to converter section
    converterSection.classList.add(`border-gradient-${gradient}`);
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
      
      chrome.storage.sync.set({ 
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
