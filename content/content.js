(function() {
  if (window.__hccInitialized) return;
  if (!globalThis.HCCSettingsCore || !globalThis.HCCCurrencies || !globalThis.HCCCurrencyParser ||
      !globalThis.HCCCurrencyDetection || !globalThis.HCCOverlay) {
    console.error('Hover Currency Converter dependencies are unavailable');
    return;
  }
  window.__hccInitialized = true;

  const {
    DEFAULT_SYNC_SETTINGS,
    DEFAULT_LOCAL_SETTINGS,
    getSiteCurrency,
    getSiteKeys,
    normalizeCurrencyCode,
    normalizeDecimalPlaces,
    normalizeDisabledSites,
    normalizeSiteCurrencies,
    normalizeSymbolCurrencies,
    normalizeTooltipPosition,
    normalizeTooltipTheme
  } = globalThis.HCCSettingsCore;

  const { SYMBOL_TO_CURRENCY, SUPPORTED_CURRENCIES, getCurrencyLabel } = globalThis.HCCCurrencies;

  const {
    AMBIGUOUS_SYMBOLS,
    collectPageCurrencies,
    findElementCurrency,
    getLocalCurrencies,
    resolveSymbolCurrency
  } = globalThis.HCCCurrencyDetection;

  const parseCurrency = globalThis.HCCCurrencyParser.createCurrencyParser({
    symbolToCurrency: SYMBOL_TO_CURRENCY,
    ambiguousSymbols: AMBIGUOUS_SYMBOLS,
    validCurrencyCodes: SUPPORTED_CURRENCIES
  });
  const overlay = globalThis.HCCOverlay.createOverlay(document);

  const DEFAULT_TARGET_CURRENCY = DEFAULT_SYNC_SETTINGS.targetCurrency;
  const MAX_DIRECT_TEXT_LENGTH = 50;
  const MAX_TEXT_LENGTH = 60;
  const MAX_TEXT_DEPTH = 3;
  const PAGE_HINT_TTL_MS = 5000;
  const MOUSE_MOVE_INTERVAL_MS = 16;
  const HIDE_DELAY_MS = 100;
  const PASSIVE_CAPTURE = { capture: true, passive: true };
  const WORD_BOUNDARY_PAIR = /[A-Za-z\u00C0-\u024F\d][A-Za-z\u00C0-\u024F\d]/;
  const SKIPPED_TEXT_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

  const numberFormats = new Map();
  let targetCurrency = DEFAULT_TARGET_CURRENCY;
  let syncTargetCurrency = null;
  let localTargetCurrencyBackup = null;
  let enabled = true;
  let siteEnabled = true;
  let disabledSites = [];
  let symbolCurrencies = {};
  let siteCurrencies = {};
  let siteCurrency = null;
  let pageCurrencyCache = null;
  let currentElement = null;
  let requestId = 0;
  let decimalPlaces = DEFAULT_LOCAL_SETTINGS.decimalPlaces;
  let tooltipPosition = DEFAULT_LOCAL_SETTINGS.tooltipPosition;
  let tooltipTheme = DEFAULT_LOCAL_SETTINGS.tooltipTheme;
  let lastMoveTime = 0;
  let listenersAttached = false;
  let activeListenersAttached = false;
  let hideTimeout = null;

  function formatNumber(value, decimals) {
    const key = decimals ?? 'default';
    let format = numberFormats.get(key);
    if (!format) {
      format = new Intl.NumberFormat(undefined, decimals === undefined
        ? undefined
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      numberFormats.set(key, format);
    }
    return format.format(value);
  }

  function clearHideTimeout() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function scheduleHide() {
    hideTimeout = setTimeout(() => {
      hideTimeout = null;
      hideTooltip();
    }, HIDE_DELAY_MS);
  }

  function hideTooltip() {
    requestId++;
    clearHideTimeout();
    overlay.hide();
    currentElement = null;
    setActiveListeners(false);
  }

  function showConversion(target, point, parsed, converted, toCurrency) {
    const { x, y } = point();
    overlay.show({
      x,
      y,
      rect: target.getBoundingClientRect(),
      originalText: `${getCurrencyLabel(parsed.currency)}${formatNumber(parsed.amount)}`,
      convertedText: `${getCurrencyLabel(toCurrency)}${formatNumber(converted, decimalPlaces)}`,
      position: tooltipPosition,
      theme: tooltipTheme
    });
  }

  async function convertElement(target, point) {
    hideTooltip();
    const parsed = findCurrencyInText(target);
    if (!parsed || parsed.currency === targetCurrency) return;

    const id = requestId;
    const toCurrency = targetCurrency;
    currentElement = target;
    setActiveListeners(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'convert',
        amount: parsed.amount,
        fromCurrency: parsed.currency,
        toCurrency
      });
      if (id !== requestId || !enabled || !siteEnabled || !target.isConnected) return;
      if (!response?.success || !Number.isFinite(response.converted)) {
        hideTooltip();
        return;
      }
      showConversion(target, point, parsed, response.converted, toCurrency);
    } catch (error) {
      if (id === requestId) hideTooltip();
      console.error('Failed to convert price:', error);
    }
  }

  function findCurrencyInText(element) {
    const directText = getDirectTextContent(element);
    if (directText && directText.length <= MAX_DIRECT_TEXT_LENGTH) {
      const parsed = parseCurrency(directText);
      if (parsed) return resolveParsedCurrency(parsed, element);
    }
    let current = element;
    for (let depth = 0; current && current !== document.body && depth < MAX_TEXT_DEPTH; depth++) {
      for (const text of getBoundedTexts(current, MAX_TEXT_LENGTH)) {
        const parsed = parseCurrency(text);
        if (parsed) return resolveParsedCurrency(parsed, element);
      }
      current = current.parentElement;
    }
    return null;
  }

  function resolveParsedCurrency(parsed, element) {
    if (!parsed.symbol) return parsed;
    const currency = resolveSymbolCurrency(parsed.symbol, {
      siteCurrency,
      elementCurrency: findElementCurrency(element),
      pageCurrencies: getPageCurrencies(),
      symbolCurrency: Object.hasOwn(symbolCurrencies, parsed.symbol) ? symbolCurrencies[parsed.symbol] : null,
      localCurrencies: getLocalCurrencies(targetCurrency, globalThis.navigator?.languages)
    });
    return SUPPORTED_CURRENCIES.has(currency) ? { currency, amount: parsed.amount } : null;
  }

  function getPageCurrencies() {
    const now = Date.now();
    const href = window.location.href;
    if (!pageCurrencyCache || pageCurrencyCache.href !== href || now - pageCurrencyCache.time > PAGE_HINT_TTL_MS) {
      pageCurrencyCache = { href, time: now, currencies: collectPageCurrencies(document, window.location) };
    }
    return pageCurrencyCache.currencies;
  }

  function getBoundedTexts(element, limit) {
    let joined = '';
    let spaced = '';
    let node = element.firstChild;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const chunk = node.textContent;
        if (chunk) {
          if (spaced && WORD_BOUNDARY_PAIR.test(`${spaced.at(-1)}${chunk[0]}`)) spaced += ' ';
          joined += chunk;
          spaced += chunk;
          if (joined.length > limit && joined.trim().length > limit) return [];
        }
      } else if (node.firstChild && !SKIPPED_TEXT_TAGS.has(node.tagName)) {
        node = node.firstChild;
        continue;
      }
      while (!node.nextSibling) {
        node = node.parentNode;
        if (!node || node === element) {
          const trimmedJoined = joined.trim();
          if (!trimmedJoined) return [];
          const trimmedSpaced = spaced.trim();
          return trimmedSpaced !== trimmedJoined && trimmedSpaced.length <= limit
            ? [trimmedJoined, trimmedSpaced]
            : [trimmedJoined];
        }
      }
      node = node.nextSibling;
    }
    return [];
  }

  function getDirectTextContent(element) {
    let text = '';
    for (let node = element.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text.trim();
  }

  function handleMouseOver(e) {
    if (!enabled || !siteEnabled) return;
    clearHideTimeout();
    const target = e.target;
    if (target === currentElement || overlay.contains(target)) return;
    convertElement(target, () => ({ x: e.clientX, y: e.clientY }));
  }

  function handleMouseOut(e) {
    if (e.target === currentElement) scheduleHide();
  }

  function handleMouseMove(e) {
    if (!currentElement || !overlay.isVisible()) return;
    const now = Date.now();
    if (now - lastMoveTime < MOUSE_MOVE_INTERVAL_MS) return;
    lastMoveTime = now;
    const rect = currentElement.getBoundingClientRect();
    const inBounds = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    if (!inBounds) {
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderCursor !== currentElement && !currentElement.contains(elementUnderCursor)) {
        hideTooltip();
        return;
      }
    }
    overlay.move(e.clientX, e.clientY, rect);
  }

  function handleScroll(e) {
    if (!currentElement || !overlay.isVisible() || !e.target.contains?.(currentElement)) return;
    if (!overlay.isAt(currentElement.getBoundingClientRect())) hideTooltip();
  }

  function handleFocus(e) {
    if (!enabled || !siteEnabled) return;
    const target = e.target;
    if (overlay.contains(target)) return;
    convertElement(target, () => {
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.bottom };
    });
  }

  function handleBlur(e) {
    if (e.target === currentElement) scheduleHide();
  }

  function handleKeyDown(e) {
    if (!enabled || !siteEnabled) return;
    if (e.key === 'Escape') {
      hideTooltip();
      return;
    }
    if (e.key === 'Enter' && document.activeElement) {
      const target = document.activeElement;
      const parsed = findCurrencyInText(target);
      if (parsed && parsed.currency !== targetCurrency) {
        if (currentElement === target && overlay.isVisible()) {
          hideTooltip();
        } else {
          handleFocus({ target });
        }
      }
    }
  }

  function setActiveListeners(active) {
    if (active === activeListenersAttached) return;
    activeListenersAttached = active;
    const method = active ? 'addEventListener' : 'removeEventListener';
    document[method]('mousemove', handleMouseMove, PASSIVE_CAPTURE);
    document[method]('mouseout', handleMouseOut, true);
    document[method]('focusout', handleBlur, true);
    document[method]('scroll', handleScroll, PASSIVE_CAPTURE);
  }

  function attachListeners() {
    if (listenersAttached) return;
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('keydown', handleKeyDown, true);
    listenersAttached = true;
  }

  function detachListeners() {
    if (!listenersAttached) return;
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('focusin', handleFocus, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    hideTooltip();
    listenersAttached = false;
  }

  function checkSiteSettings() {
    const siteKeys = getSiteKeys(window.location.hostname);
    siteEnabled = !disabledSites.some(site => siteKeys.includes(site));
    siteCurrency = getSiteCurrency(siteCurrencies, siteKeys);
  }

  function updateListenerState() {
    if (enabled && siteEnabled) {
      attachListeners();
    } else {
      detachListeners();
    }
  }

  function handleStorageChange(changes, areaName) {
    if ((areaName === 'sync' && ['targetCurrency', 'symbolCurrencies', 'siteCurrencies'].some(key => changes[key])) ||
        (areaName === 'local' && ['targetCurrencyBackup', 'decimalPlaces', 'tooltipPosition', 'tooltipTheme'].some(key => changes[key]))) {
      hideTooltip();
    }
    if (areaName === 'sync' && changes.targetCurrency) {
      syncTargetCurrency = normalizeCurrencyCode(changes.targetCurrency.newValue);
      targetCurrency = syncTargetCurrency || localTargetCurrencyBackup || DEFAULT_TARGET_CURRENCY;
    }
    if (areaName === 'sync' && changes.enabled) {
      enabled = typeof changes.enabled.newValue === 'boolean'
        ? changes.enabled.newValue
        : DEFAULT_SYNC_SETTINGS.enabled;
      updateListenerState();
    }
    if (areaName === 'sync' && changes.symbolCurrencies) {
      symbolCurrencies = normalizeSymbolCurrencies(changes.symbolCurrencies.newValue);
    }
    if (areaName === 'sync' && (changes.disabledSites || changes.siteCurrencies)) {
      if (changes.disabledSites) {
        disabledSites = normalizeDisabledSites(changes.disabledSites.newValue);
      }
      if (changes.siteCurrencies) {
        siteCurrencies = normalizeSiteCurrencies(changes.siteCurrencies.newValue);
      }
      checkSiteSettings();
      updateListenerState();
    }
    if (areaName === 'local') {
      if (changes.targetCurrencyBackup) {
        localTargetCurrencyBackup = normalizeCurrencyCode(changes.targetCurrencyBackup.newValue);
        if (!syncTargetCurrency) {
          targetCurrency = localTargetCurrencyBackup || DEFAULT_TARGET_CURRENCY;
        }
      }
      if (changes.decimalPlaces) {
        decimalPlaces = normalizeDecimalPlaces(changes.decimalPlaces.newValue);
      }
      if (changes.tooltipPosition) {
        tooltipPosition = normalizeTooltipPosition(changes.tooltipPosition.newValue);
      }
      if (changes.tooltipTheme) {
        tooltipTheme = normalizeTooltipTheme(changes.tooltipTheme.newValue);
      }
    }
  }

  async function init() {
    chrome.storage.onChanged.addListener(handleStorageChange);

    try {
      const [syncResult, localResult] = await Promise.all([
        chrome.storage.sync.get({
          targetCurrency: null,
          enabled: true,
          disabledSites: [],
          symbolCurrencies: {},
          siteCurrencies: {}
        }),
        chrome.storage.local.get({
          targetCurrencyBackup: null,
          decimalPlaces: DEFAULT_LOCAL_SETTINGS.decimalPlaces,
          tooltipPosition: DEFAULT_LOCAL_SETTINGS.tooltipPosition,
          tooltipTheme: DEFAULT_LOCAL_SETTINGS.tooltipTheme
        })
      ]);

      syncTargetCurrency = normalizeCurrencyCode(syncResult.targetCurrency);
      localTargetCurrencyBackup = normalizeCurrencyCode(localResult.targetCurrencyBackup);
      targetCurrency = syncTargetCurrency || localTargetCurrencyBackup || DEFAULT_TARGET_CURRENCY;

      if (!syncTargetCurrency && localTargetCurrencyBackup) {
        chrome.storage.sync.set({ targetCurrency: localTargetCurrencyBackup }).catch(error => {
          console.error('Failed to repair sync target currency:', error);
        });
      }

      enabled = typeof syncResult.enabled === 'boolean' ? syncResult.enabled : DEFAULT_SYNC_SETTINGS.enabled;
      disabledSites = normalizeDisabledSites(syncResult.disabledSites);
      symbolCurrencies = normalizeSymbolCurrencies(syncResult.symbolCurrencies);
      siteCurrencies = normalizeSiteCurrencies(syncResult.siteCurrencies);
      checkSiteSettings();
      updateListenerState();

      decimalPlaces = normalizeDecimalPlaces(localResult.decimalPlaces);
      tooltipPosition = normalizeTooltipPosition(localResult.tooltipPosition);
      tooltipTheme = normalizeTooltipTheme(localResult.tooltipTheme);
    } catch (error) {
      console.error('Failed to initialize content settings:', error);
      checkSiteSettings();
      updateListenerState();
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'hcc:ping') {
      sendResponse({ ready: true });
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();