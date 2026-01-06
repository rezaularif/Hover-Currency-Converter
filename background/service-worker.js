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

// Inject content script and open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // Open side panel first
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
  
  // Inject content script and CSS into the active tab (if possible)
  // Only inject on http/https pages, skip chrome:// and other restricted pages
  if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
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
      // Ignore errors for restricted pages
      console.log('Could not inject script:', error);
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    targetCurrency: 'EUR',
    enabled: true
  });

  // Set default user preferences
  chrome.storage.local.set({
    decimalPlaces: 2,
    tooltipPosition: 'below',
    tooltipTheme: 'purple-gradient'
  });

  fetchRates();
});
