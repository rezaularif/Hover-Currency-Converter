const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const API_FALLBACK = 'https://latest.currency-api.pages.dev/v1';

async function fetchFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
let ratesCache = null;
let lastFetch = 0;

async function fetchRates() {
  const now = Date.now();
  
  if (ratesCache && (now - lastFetch) < CACHE_DURATION) {
    return ratesCache;
  }
  
  try {
    const stored = await chrome.storage.local.get(['rates', 'lastFetch']);
    if (stored.rates && stored.lastFetch && (now - stored.lastFetch) < CACHE_DURATION) {
      ratesCache = stored.rates;
      lastFetch = stored.lastFetch;
      return ratesCache;
    }
    
    let data;
    try {
      data = await fetchFromAPI(`${API_BASE}/currencies/usd.json`);
    } catch (e) {
      data = await fetchFromAPI(`${API_FALLBACK}/currencies/usd.json`);
    }
    
    if (data && data.usd) {
      const rates = {};
      for (const [code, rate] of Object.entries(data.usd)) {
        rates[code.toUpperCase()] = rate;
      }
      rates.USD = 1;
      ratesCache = rates;
      lastFetch = now;
      await chrome.storage.local.set({ rates: ratesCache, lastFetch: now });
      return ratesCache;
    }
    
    return stored.rates || null;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    const stored = await chrome.storage.local.get(['rates']);
    return stored.rates || null;
  }
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!rates || rates[fromCurrency] === undefined || rates[toCurrency] === undefined) {
    return null;
  }
  
  const amountInUSD = amount / rates[fromCurrency];
  const converted = amountInUSD * rates[toCurrency];
  
  return converted;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'convert') {
    const { amount, fromCurrency, toCurrency } = message;

    fetchRates().then(rates => {
      if (rates) {
        const converted = convertCurrency(amount, fromCurrency, toCurrency, rates);
        sendResponse({ success: true, converted });
      } else {
        sendResponse({ success: false });
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

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
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
