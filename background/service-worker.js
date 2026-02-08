const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const API_FALLBACK = 'https://latest.currency-api.pages.dev/v1';

// Currency decimal places configuration (ISO 4217 standard)
const CURRENCY_DECIMALS = {
  // Zero decimal currencies
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, IDR: 0, JPY: 0, KMF: 0, KRW: 0,
  PYG: 0, RWF: 0, UGX: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
  // Three decimal currencies
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3
};

function getCurrencyDecimals(currencyCode) {
  return CURRENCY_DECIMALS[currencyCode] ?? 2; // Default to 2 decimals
}

// Retry with exponential backoff
async function fetchWithRetry(url, maxAttempts = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response structure');
      }

      return data;
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Promise-based lock to prevent concurrent fetches
let fetchInProgress = null;

let ratesCache = null;
let lastFetch = 0;

async function fetchRates() {
  const now = Date.now();

  // Return cached data if still valid
  if (ratesCache && (now - lastFetch) < CACHE_DURATION) {
    return ratesCache;
  }

  // If a fetch is already in progress, wait for it
  if (fetchInProgress) {
    return fetchInProgress;
  }

  // Start a new fetch with lock
  fetchInProgress = (async () => {
    try {
      const stored = await chrome.storage.local.get(['rates', 'lastFetch']);
      if (stored.rates && stored.lastFetch && (now - stored.lastFetch) < CACHE_DURATION) {
        ratesCache = stored.rates;
        lastFetch = stored.lastFetch;
        return ratesCache;
      }

      let data;
      try {
        data = await fetchWithRetry(`${API_BASE}/currencies/usd.json`);
      } catch (e) {
        // Try fallback API
        data = await fetchWithRetry(`${API_FALLBACK}/currencies/usd.json`);
      }

      if (data && data.usd) {
        const rates = {};
        for (const [code, rate] of Object.entries(data.usd)) {
          rates[code.toUpperCase()] = rate;
        }
        rates.USD = 1;
        ratesCache = rates;
        lastFetch = Date.now();
        await chrome.storage.local.set({ rates: ratesCache, lastFetch });
        return ratesCache;
      }

      return stored.rates || null;
    } catch (error) {
      console.error('Failed to fetch rates:', error.message);
      const stored = await chrome.storage.local.get(['rates']);
      return stored.rates || null;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!rates || rates[fromCurrency] === undefined || rates[toCurrency] === undefined) {
    return null;
  }

  const amountInUSD = amount / rates[fromCurrency];
  const converted = amountInUSD * rates[toCurrency];
  const decimals = getCurrencyDecimals(toCurrency);

  return { converted, decimals };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'convert') {
    const { amount, fromCurrency, toCurrency } = message;

    fetchRates().then(rates => {
      if (rates) {
        const result = convertCurrency(amount, fromCurrency, toCurrency, rates);
        if (result) {
          sendResponse({
            success: true,
            converted: result.converted,
            decimals: result.decimals
          });
        } else {
          sendResponse({ success: false, error: 'Invalid currency' });
        }
      } else {
        sendResponse({ success: false, error: 'No rates available' });
      }
    });

    return true;
  }

  if (message.type === 'getRates') {
    fetchRates().then(rates => {
      sendResponse({ success: !!rates });
    });
    return true;
  }
});

const DEFAULT_SYNC_SETTINGS = {
  targetCurrency: 'EUR',
  fromCurrency: 'USD',
  enabled: true,
  disabledSites: []
};

const DEFAULT_LOCAL_SETTINGS = {
  decimalPlaces: 2,
  tooltipPosition: 'below',
  tooltipTheme: 'purple-gradient',
  resultGradient: 'purple-orange',
  targetCurrencyBackup: 'EUR',
  fromCurrencyBackup: 'USD'
};

function normalizeCurrencyCode(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

// Inject content script if needed and open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }

  if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    let isContentReady = false;

    try {
      const pingResponse = await chrome.tabs.sendMessage(tab.id, { type: 'hcc:ping' });
      isContentReady = !!pingResponse?.ready;
    } catch (error) {
      isContentReady = false;
    }

    if (!isContentReady) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js']
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['content/content.css']
        });
      } catch (error) {
        console.log('Could not inject script:', error);
      }
    }
  }
});

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    if (details.reason === 'install') {
      await chrome.storage.sync.set(DEFAULT_SYNC_SETTINGS);
      await chrome.storage.local.set(DEFAULT_LOCAL_SETTINGS);
      chrome.tabs.create({ url: 'welcome/welcome.html' });
    } else {
      const [syncValues, localValues] = await Promise.all([
        chrome.storage.sync.get({
          targetCurrency: null,
          fromCurrency: null,
          enabled: null,
          disabledSites: null
        }),
        chrome.storage.local.get({
          decimalPlaces: null,
          tooltipPosition: null,
          tooltipTheme: null,
          resultGradient: null,
          targetCurrencyBackup: null,
          fromCurrencyBackup: null
        })
      ]);

      const syncTarget = normalizeCurrencyCode(syncValues.targetCurrency);
      const syncFrom = normalizeCurrencyCode(syncValues.fromCurrency);
      const localTarget = normalizeCurrencyCode(localValues.targetCurrencyBackup);
      const localFrom = normalizeCurrencyCode(localValues.fromCurrencyBackup);

      const syncUpdates = {};
      if (!syncTarget) syncUpdates.targetCurrency = localTarget || DEFAULT_SYNC_SETTINGS.targetCurrency;
      if (!syncFrom) syncUpdates.fromCurrency = localFrom || DEFAULT_SYNC_SETTINGS.fromCurrency;
      if (typeof syncValues.enabled !== 'boolean') syncUpdates.enabled = DEFAULT_SYNC_SETTINGS.enabled;
      if (!Array.isArray(syncValues.disabledSites)) syncUpdates.disabledSites = DEFAULT_SYNC_SETTINGS.disabledSites;
      if (Object.keys(syncUpdates).length > 0) {
        await chrome.storage.sync.set(syncUpdates);
      }

      const effectiveTarget = syncTarget || syncUpdates.targetCurrency || DEFAULT_SYNC_SETTINGS.targetCurrency;
      const effectiveFrom = syncFrom || syncUpdates.fromCurrency || DEFAULT_SYNC_SETTINGS.fromCurrency;

      const localUpdates = {};
      if (localValues.decimalPlaces === null) localUpdates.decimalPlaces = DEFAULT_LOCAL_SETTINGS.decimalPlaces;
      if (localValues.tooltipPosition === null) localUpdates.tooltipPosition = DEFAULT_LOCAL_SETTINGS.tooltipPosition;
      if (localValues.tooltipTheme === null) localUpdates.tooltipTheme = DEFAULT_LOCAL_SETTINGS.tooltipTheme;
      if (localValues.resultGradient === null) localUpdates.resultGradient = DEFAULT_LOCAL_SETTINGS.resultGradient;
      if (!localTarget) localUpdates.targetCurrencyBackup = effectiveTarget;
      if (!localFrom) localUpdates.fromCurrencyBackup = effectiveFrom;
      if (Object.keys(localUpdates).length > 0) {
        await chrome.storage.local.set(localUpdates);
      }
    }
  } catch (error) {
    console.error('Failed to initialize extension settings:', error);
  } finally {
    fetchRates();
  }
});

// Pre-fetch rates when browser starts (for faster first conversion)
chrome.runtime.onStartup.addListener(() => {
  fetchRates();
});
