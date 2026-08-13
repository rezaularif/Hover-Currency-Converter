import {
  collectChangedSettings,
  DEFAULT_LOCAL_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  resolveLocalSettings,
  resolveSyncSettings
} from '../lib/settings.js';
import { fetchJsonWithRetry } from '../lib/network.js';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const API_TIMEOUT_MS = 10000;
const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const API_FALLBACK = 'https://latest.currency-api.pages.dev/v1';

function getCurrencyDecimals(currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
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
        data = await fetchJsonWithRetry(`${API_BASE}/currencies/usd.json`, { timeoutMs: API_TIMEOUT_MS });
      } catch (e) {
        data = await fetchJsonWithRetry(`${API_FALLBACK}/currencies/usd.json`, { timeoutMs: API_TIMEOUT_MS });
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
          files: ['lib/settings-core.js', 'lib/currency-parser.js', 'content/content.js']
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

      const normalizedSyncSettings = resolveSyncSettings(syncValues, localValues);
      const normalizedLocalSettings = resolveLocalSettings(localValues, normalizedSyncSettings);

      const syncUpdates = collectChangedSettings(syncValues, normalizedSyncSettings);
      if (Object.keys(syncUpdates).length > 0) {
        await chrome.storage.sync.set(syncUpdates);
      }

      const localUpdates = collectChangedSettings(localValues, normalizedLocalSettings);
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
