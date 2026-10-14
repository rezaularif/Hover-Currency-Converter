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

const currencyDecimals = new Map();

function getCurrencyDecimals(currencyCode) {
  if (currencyDecimals.has(currencyCode)) return currencyDecimals.get(currencyCode);
  let decimals = 2;
  try {
    decimals = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode
    }).resolvedOptions().maximumFractionDigits;
  } catch {
    decimals = 2;
  }
  currencyDecimals.set(currencyCode, decimals);
  return decimals;
}

// Promise-based lock to prevent concurrent fetches
let fetchInProgress = null;

let ratesCache = null;
let lastFetch = 0;

function parseRates(data) {
  const usdRates = data?.usd;
  if (!usdRates || typeof usdRates !== 'object' || Array.isArray(usdRates)) return null;
  const rates = {};
  for (const [code, rate] of Object.entries(usdRates)) {
    if (Number.isFinite(rate) && rate > 0) rates[code.toUpperCase()] = rate;
  }
  rates.USD = 1;
  return Object.keys(rates).some(code => code !== 'USD') ? rates : null;
}

async function fetchRatesFrom(base) {
  const rates = parseRates(await fetchJsonWithRetry(`${base}/currencies/usd.json`, { timeoutMs: API_TIMEOUT_MS }));
  if (!rates) throw new Error('Invalid rates API response');
  return rates;
}

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
      const stored = await chrome.storage.local.get({ rates: null, lastFetch: 0 });
      if (stored.rates && stored.lastFetch && (now - stored.lastFetch) < CACHE_DURATION) {
        ratesCache = stored.rates;
        lastFetch = stored.lastFetch;
        return ratesCache;
      }

      let rates;
      try {
        rates = await fetchRatesFrom(API_BASE);
      } catch {
        rates = await fetchRatesFrom(API_FALLBACK);
      }

      ratesCache = rates;
      lastFetch = Date.now();
      await chrome.storage.local.set({ rates: ratesCache, lastFetch });
      return ratesCache;
    } catch (error) {
      console.error('Failed to fetch rates:', error.message);
      try {
        const stored = await chrome.storage.local.get({ rates: null, lastFetch: 0 });
        if (stored.rates && !ratesCache) {
          ratesCache = stored.rates;
          lastFetch = stored.lastFetch || 0;
        }
        return ratesCache || stored.rates || null;
      } catch {
        return ratesCache;
      }
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (!Number.isFinite(amount) || amount <= 0 ||
      typeof fromCurrency !== 'string' || !/^[A-Z]{3}$/.test(fromCurrency) ||
      typeof toCurrency !== 'string' || !/^[A-Z]{3}$/.test(toCurrency) ||
      !rates || !Object.hasOwn(rates, fromCurrency) || !Object.hasOwn(rates, toCurrency) ||
      !Number.isFinite(rates[fromCurrency]) || rates[fromCurrency] <= 0 ||
      !Number.isFinite(rates[toCurrency]) || rates[toCurrency] <= 0) {
    return null;
  }

  const amountInUSD = amount / rates[fromCurrency];
  const converted = amountInUSD * rates[toCurrency];
  const decimals = getCurrencyDecimals(toCurrency);

  return Number.isFinite(converted) ? { converted, decimals } : null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'convert' && message?.type !== 'getRates') return;

  fetchRates().then(rates => {
    if (message.type === 'getRates') {
      sendResponse({ success: !!rates, lastFetch: lastFetch || null });
      return;
    }
    const result = convertCurrency(message.amount, message.fromCurrency, message.toCurrency, rates);
    sendResponse(result
      ? { success: true, ...result }
      : { success: false, error: rates ? 'Invalid conversion' : 'No rates available' });
  }).catch(error => {
    console.error('Failed to handle conversion request:', error);
    sendResponse({ success: false, error: 'Conversion unavailable' });
  });
  return true;
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
      const [contentScript] = chrome.runtime.getManifest().content_scripts;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: contentScript.js
        });

        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: contentScript.css
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
          disabledSites: null,
          symbolCurrencies: null,
          siteCurrencies: null
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
