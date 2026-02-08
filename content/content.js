(function() {
  if (window.__hccInitialized) return;
  window.__hccInitialized = true;

  const CURRENCY_SYMBOLS = {
    AED: '🇦🇪 د.إ', AFN: '🇦🇫 Af', ALL: '🇦🇱 L', AMD: '🇦🇲 ֏', ANG: '🇦🇼 ƒ',
    AOA: '🇦🇴 Kz', ARS: '🇦🇷 $', AUD: '🇦🇺 A$', AWG: '🇦🇼 ƒ', AZN: '🇦🇿 ₼',
    BAM: '🇧🇦 KM', BBD: '🇧🇧 $', BDT: '🇧🇩 ৳', BGN: '🇧🇬 лв', BHD: '🇧🇭 .د.ب',
    BIF: '🇧🇮 Fr', BMD: '🇧🇲 $', BND: '🇧🇳 $', BOB: '🇧🇴 Bs', BRL: '🇧🇷 R$',
    BSD: '🇧🇸 $', BTN: '🇧🇹 Nu.', BWP: '🇧🇼 P', BYN: '🇧🇾 Br', BZD: '🇧🇿 $',
    CAD: '🇨🇦 C$', CDF: '🇨🇩 Fr', CHF: '🇨🇭 CHF', CLP: '🇨🇱 $', CNY: '🇨🇳 ¥',
    COP: '🇨🇴 $', CRC: '🇨🇷 ₡', CUP: '🇨🇺 $', CVE: '🇨🇻 $', CZK: '🇨🇿 Kč',
    DJF: '🇩🇯 Fr', DKK: '🇩🇰 kr', DOP: '🇩🇴 $', DZD: '🇩🇿 د.ج', EGP: '🇪🇬 E£',
    ERN: '🇪🇷 Nfk', ETB: '🇪🇹 Br', EUR: '🇪🇺 €', FJD: '🇫🇯 $', FKP: '🇫🇰 £',
    GBP: '🇬🇧 £', GEL: '🇬🇪 ₾', GHS: '🇬🇭 ₵', GIP: '🇬🇮 £', GMD: '🇬🇲 D',
    GNF: '🇬🇳 Fr', GTQ: '🇬🇹 Q', GYD: '🇬🇾 $', HKD: '🇭🇰 HK$', HNL: '🇭🇳 L',
    HRK: '🇭🇷 kn', HTG: '🇭🇹 G', HUF: '🇭🇺 Ft', IDR: '🇮🇩 Rp', ILS: '🇮🇱 ₪',
    INR: '🇮🇳 ₹', IQD: '🇮🇶 ع.د', IRR: '🇮🇷 ﷼', ISK: '🇮🇸 kr', JMD: '🇯🇲 $',
    JOD: '🇯🇴 د.ا', JPY: '🇯🇵 ¥', KES: '🇰🇪 KSh', KGS: '🇰🇬 сом', KHR: '🇰🇭 ៛',
    KMF: '🇰🇲 Fr', KRW: '🇰🇷 ₩', KWD: '🇰🇼 د.ك', KYD: '🇰🇾 $', KZT: '🇰🇿 ₸',
    LAK: '🇱🇦 ₭', LBP: '🇱🇧 ل.ل', LKR: '🇱🇰 Rs', LRD: '🇱🇷 $', LSL: '🇱🇸 L',
    LYD: '🇱🇾 ل.د', MAD: '🇲🇦 د.م.', MDL: '🇲🇩 L', MGA: '🇲🇬 Ar', MKD: '🇲🇰 ден',
    MMK: '🇲🇲 K', MNT: '🇲🇳 ₮', MOP: '🇲🇴 P', MRU: '🇲🇷 UM', MUR: '🇲🇺 Rs',
    MVR: '🇲🇻 .MRf', MWK: '🇲🇼 MK', MXN: '🇲🇽 $', MYR: '🇲🇾 RM', MZN: '🇲🇿 MT',
    NAD: '🇳🇦 $', NGN: '🇳🇬 ₦', NIO: '🇳🇮 C$', NOK: '🇳🇴 kr', NPR: '🇳🇵 Rs',
    NZD: '🇳🇿 NZ$', OMR: '🇴🇲 ر.ع.', PAB: '🇵🇦 B/.', PEN: '🇵🇪 S/', PGK: '🇵🇬 K',
    PHP: '🇵🇭 ₱', PKR: '🇵🇰 ₨', PLN: '🇵🇱 zł', PYG: '🇵🇾 ₲', QAR: '🇶🇦 ر.ق',
    RON: '🇷🇴 lei', RSD: '🇷🇸 дин.', RUB: '🇷🇺 ₽', RWF: '🇷🇼 Fr', SAR: '🇸🇦 ر.س',
    SBD: '🇸🇧 $', SCR: '🇸🇨 Rs', SDG: '🇸🇩 ج.س.', SEK: '🇸🇪 kr', SGD: '🇸🇬 $',
    SHP: '🇸🇭 £', SLE: '🇸🇱 Le', SLL: '🇸🇱 Le', SOS: '🇸🇴 Sh', SRD: '🇸🇷 $',
    SSP: '🇸🇸 £', STD: '🇸🇹 Db', STN: '🇸🇹 Db', SYP: '🇸🇾 £', SZL: '🇸🇿 E',
    THB: '🇹🇭 ฿', TJS: '🇹🇯 SM', TMT: '🇹🇲 m', TND: '🇹🇳 د.ت', TOP: '🇹🇴 T$',
    TRY: '🇹🇷 ₺', TTD: '🇹🇹 $', TWD: '🇹🇼 $', TZS: '🇹🇿 Sh', UAH: '🇺🇦 ₴',
    UGX: '🇺🇬 USh', USD: '🇺🇸 $', UYU: '🇺🇾 $', UZS: '🇺🇿 so\'m',
    VES: '🇻🇪 Bs.S', VND: '🇻🇳 ₫', VUV: '🇻🇺 VT', WST: '🇼🇸 T',
    XAF: '🇨🇲 Fr', XCD: '🇦🇨 $', XDR: '🌐 SDR', XOF: '🇧🇯 Fr', XPF: '🇵🇫 Fr',
    YER: '🇾🇪 ﷼', ZAR: '🇿🇦 R', ZMW: '🇿🇲 ZK', ZWL: '🇿🇼 $'
  };

  const SYMBOL_TO_CURRENCY = {
    '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR',
    '₩': 'KRW', '₺': 'TRY', '฿': 'THB', '₱': 'PHP', '₪': 'ILS',
    '৳': 'BDT', '₨': 'PKR', '₽': 'RUB', '₸': 'KZT', '₮': 'MNT',
    '₭': 'LAK', '₾': 'GEL', '₦': 'NGN', '₲': 'PYG', '₴': 'UAH',
    '₫': 'VND', '₡': 'CRC', '₵': 'GHS', '﷼': 'SAR', 'R$': 'BRL',
    'zł': 'PLN', 'Kč': 'CZK', 'kr': 'SEK', 'CHF': 'CHF'
  };

  const VALID_CURRENCY_CODES = new Set(Object.keys(CURRENCY_SYMBOLS));

  const REGEX_SYMBOL_BEFORE = /([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])\s*([\d,]+(?:\.\d{1,2})?)/;
  const REGEX_SYMBOL_AFTER = /([\d,]+(?:\.\d{1,2})?)\s*([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])/;
  const REGEX_CODE_AFTER = /([\d,]+(?:\.\d{1,2})?)\s*([A-Z]{3})\b/;
  const REGEX_CODE_BEFORE = /\b([A-Z]{3})\s*([\d,]+(?:\.\d{1,2})?)/;

  const REGEX_SYMBOL_BEFORE_EU = /([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])\s*([\d.]+(?:,\d{1,2})?)/;
  const REGEX_SYMBOL_AFTER_EU = /([\d.]+(?:,\d{1,2})?)\s*([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])/;
  const REGEX_CODE_AFTER_EU = /([\d.]+(?:,\d{1,2})?)\s*([A-Z]{3})\b/;
  const REGEX_CODE_BEFORE_EU = /\b([A-Z]{3})\s*([\d.]+(?:,\d{1,2})?)/;
  const DEFAULT_TARGET_CURRENCY = 'EUR';
  const MULTI_PART_TLDS = new Set([
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
    'com.au', 'net.au', 'org.au',
    'co.nz', 'co.jp', 'co.kr', 'co.in', 'co.id', 'co.za',
    'com.br', 'com.mx', 'com.tr', 'com.sg', 'com.hk', 'com.cn', 'com.tw', 'com.ar', 'com.sa', 'com.eg', 'com.ng'
  ]);

  let tooltip = null;
  let targetCurrency = DEFAULT_TARGET_CURRENCY;
  let syncTargetCurrency = null;
  let localTargetCurrencyBackup = null;
  let enabled = true;
  let siteEnabled = true;
  let disabledSites = [];
  let currentElement = null;
  let pendingRequest = null;
  let decimalPlaces = 2;
  let tooltipPosition = 'below';
  let tooltipTheme = 'purple-gradient';
  let lastMoveTime = 0;
  let listenersAttached = false;
  let hideTimeout = null;

  function throttle(fn, delay) {
    let lastCall = 0;
    let timeout = null;
    return function(...args) {
      const now = Date.now();
      const remaining = delay - (now - lastCall);
      if (remaining <= 0) {
        lastCall = now;
        fn.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  function createTooltip() {
    if (tooltip) return;
    tooltip = document.createElement('div');
    tooltip.className = 'hcc-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
  }

  function showTooltip(x, y, original, converted, fromCode, toCode, serverDecimals) {
    if (!tooltip) createTooltip();
    const fromSymbol = CURRENCY_SYMBOLS[fromCode] || fromCode;
    const toSymbol = CURRENCY_SYMBOLS[toCode] || toCode;
    const displayDecimals = serverDecimals !== undefined ? serverDecimals : decimalPlaces;
    tooltip.textContent = '';
    const originalSpan = document.createElement('span');
    originalSpan.className = 'hcc-original';
    originalSpan.textContent = `${fromSymbol}${original.toLocaleString()}`;
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'hcc-arrow';
    arrowSpan.textContent = '→';
    const convertedSpan = document.createElement('span');
    convertedSpan.className = 'hcc-converted';
    convertedSpan.textContent = `${toSymbol}${converted.toLocaleString(undefined, { minimumFractionDigits: displayDecimals, maximumFractionDigits: displayDecimals })}`;
    tooltip.appendChild(originalSpan);
    tooltip.appendChild(arrowSpan);
    tooltip.appendChild(convertedSpan);
    positionTooltip(x, y);
    requestAnimationFrame(() => {
      tooltip.classList.add('visible');
    });
  }

  function positionTooltip(x, y) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 200;
    const tooltipHeight = 50;
    const offset = 15;
    let left, top;
    switch (tooltipPosition) {
      case 'above':
        left = x;
        top = y - tooltipHeight - offset;
        break;
      case 'below':
        left = x;
        top = y + offset;
        break;
      case 'left':
        left = x - tooltipWidth - offset;
        top = y - tooltipHeight / 2;
        break;
      case 'right':
        left = x + offset;
        top = y - tooltipHeight / 2;
        break;
      default:
        left = x;
        top = y + offset;
    }
    if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    if (top + tooltipHeight > viewportHeight) {
      top = viewportHeight - tooltipHeight - 10;
    }
    if (top < 10) {
      top = 10;
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.remove('hcc-pos-above', 'hcc-pos-below', 'hcc-pos-left', 'hcc-pos-right');
    tooltip.classList.add(`hcc-pos-${tooltipPosition}`);
    tooltip.className = tooltip.className.replace(/hcc-theme-[\w-]+/g, '').trim();
    if (tooltipTheme !== 'purple-gradient') {
      tooltip.classList.add(`hcc-theme-${tooltipTheme}`);
    }
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
    if (currentElement) {
      currentElement.classList.remove('hcc-highlight');
      currentElement = null;
    }
  }

  function clearCurrentElement() {
    if (currentElement) {
      currentElement.classList.remove('hcc-highlight');
      currentElement = null;
    }
  }

  function parseCurrency(text) {
    let match, currency, amount;
    if ((match = text.match(REGEX_SYMBOL_BEFORE))) {
      currency = SYMBOL_TO_CURRENCY[match[1]];
      amount = parseFloat(match[2].replace(/,/g, ''));
    } else if ((match = text.match(REGEX_SYMBOL_AFTER))) {
      currency = SYMBOL_TO_CURRENCY[match[2]];
      amount = parseFloat(match[1].replace(/,/g, ''));
    } else if ((match = text.match(REGEX_CODE_BEFORE))) {
      currency = match[1];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[2].replace(/,/g, ''));
    } else if ((match = text.match(REGEX_CODE_AFTER))) {
      currency = match[2];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[1].replace(/,/g, ''));
    } else if ((match = text.match(REGEX_SYMBOL_BEFORE_EU))) {
      currency = SYMBOL_TO_CURRENCY[match[1]];
      amount = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
    } else if ((match = text.match(REGEX_SYMBOL_AFTER_EU))) {
      currency = SYMBOL_TO_CURRENCY[match[2]];
      amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    } else if ((match = text.match(REGEX_CODE_BEFORE_EU))) {
      currency = match[1];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
    } else if ((match = text.match(REGEX_CODE_AFTER_EU))) {
      currency = match[2];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    }
    if (currency && !isNaN(amount) && amount > 0) {
      return { currency, amount };
    }
    return null;
  }

  function findCurrencyInText(element) {
    const directText = getDirectTextContent(element);
    if (directText && directText.length <= 50) {
      const parsed = parseCurrency(directText);
      if (parsed) return parsed;
    }
    let current = element;
    let depth = 0;
    const maxDepth = 3;
    while (current && current !== document.body && depth < maxDepth) {
      const text = current.textContent?.trim();
      if (text && text.length <= 200) {
        const parsed = parseCurrency(text);
        if (parsed) return parsed;
      }
      current = current.parentElement;
      depth++;
    }
    return null;
  }

  function getDirectTextContent(element) {
    let text = '';
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text.trim();
  }

  function handleMouseOver(e) {
    if (!enabled || !siteEnabled) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    const target = e.target;
    if (target === tooltip || tooltip?.contains(target)) return;
    if (target === currentElement) return;
    const parsed = findCurrencyInText(target);
    if (parsed && parsed.currency !== targetCurrency) {
      clearCurrentElement();
      currentElement = target;
      target.classList.add('hcc-highlight');
      pendingRequest = target;
      chrome.runtime.sendMessage({
        type: 'convert',
        amount: parsed.amount,
        fromCurrency: parsed.currency,
        toCurrency: targetCurrency
      }, response => {
        if (response?.success && pendingRequest === target && currentElement === target) {
          showTooltip(e.clientX, e.clientY, parsed.amount, response.converted, parsed.currency, targetCurrency, response.decimals);
        }
      });
    } else {
      hideTooltip();
      pendingRequest = null;
    }
  }

  function handleMouseOut(e) {
    const target = e.target;
    if (target === currentElement) {
      hideTimeout = setTimeout(() => {
        hideTooltip();
        hideTimeout = null;
      }, 100);
    }
  }

  function handleMouseMove(e) {
    if (!tooltip || !tooltip.classList.contains('visible') || !currentElement) return;
    const now = Date.now();
    if (now - lastMoveTime < 16) return;
    lastMoveTime = now;
    positionTooltip(e.clientX, e.clientY);
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
        pendingRequest = null;
      }
    }
  }

  function handleFocus(e) {
    if (!enabled || !siteEnabled) return;
    const target = e.target;
    if (target === tooltip) return;
    const parsed = findCurrencyInText(target);
    if (parsed && parsed.currency !== targetCurrency) {
      clearCurrentElement();
      currentElement = target;
      target.classList.add('hcc-highlight');
      pendingRequest = target;
      chrome.runtime.sendMessage({
        type: 'convert',
        amount: parsed.amount,
        fromCurrency: parsed.currency,
        toCurrency: targetCurrency
      }, response => {
        if (response?.success && pendingRequest === target && currentElement === target) {
          const rect = target.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.bottom;
          showTooltip(x, y, parsed.amount, response.converted, parsed.currency, targetCurrency, response.decimals);
        }
      });
    }
  }

  function handleBlur(e) {
    const target = e.target;
    if (target === currentElement) {
      hideTimeout = setTimeout(() => {
        hideTooltip();
        hideTimeout = null;
      }, 100);
    }
  }

  function handleKeyDown(e) {
    if (!enabled || !siteEnabled) return;
    if (e.key === 'Escape' && tooltip?.classList.contains('visible')) {
      hideTooltip();
      return;
    }
    if (e.key === 'Enter' && document.activeElement) {
      const target = document.activeElement;
      const parsed = findCurrencyInText(target);
      if (parsed && parsed.currency !== targetCurrency) {
        if (currentElement === target && tooltip?.classList.contains('visible')) {
          hideTooltip();
        } else {
          handleFocus({ target });
        }
      }
    }
  }

  let throttledMouseOver = null;

  function attachListeners() {
    if (listenersAttached) return;
    createTooltip();
    throttledMouseOver = throttle(handleMouseOver, 50);
    document.addEventListener('mouseover', throttledMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);
    document.addEventListener('keydown', handleKeyDown, true);
    listenersAttached = true;
  }

  function detachListeners() {
    if (!listenersAttached) return;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    document.removeEventListener('mouseover', throttledMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('focusin', handleFocus, true);
    document.removeEventListener('focusout', handleBlur, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    hideTooltip();
    listenersAttached = false;
  }

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

  function normalizeCurrencyCode(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
  }

  function checkSiteEnabled() {
    const siteKeys = getSiteKeys(window.location.hostname);
    siteEnabled = !disabledSites.some(site => siteKeys.includes(site));
  }

  function updateListenerState() {
    if (enabled && siteEnabled) {
      attachListeners();
    } else {
      detachListeners();
    }
  }

  async function init() {
    try {
      const [syncResult, localResult] = await Promise.all([
        chrome.storage.sync.get({
          targetCurrency: null,
          enabled: true,
          disabledSites: []
        }),
        chrome.storage.local.get({
          targetCurrencyBackup: null,
          decimalPlaces: 2,
          tooltipPosition: 'below',
          tooltipTheme: 'purple-gradient'
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

      enabled = syncResult.enabled;
      disabledSites = syncResult.disabledSites;
      checkSiteEnabled();
      updateListenerState();

      decimalPlaces = localResult.decimalPlaces;
      tooltipPosition = localResult.tooltipPosition;
      tooltipTheme = localResult.tooltipTheme;
    } catch (error) {
      console.error('Failed to initialize content settings:', error);
      checkSiteEnabled();
      updateListenerState();
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.targetCurrency) {
        syncTargetCurrency = normalizeCurrencyCode(changes.targetCurrency.newValue);
        targetCurrency = syncTargetCurrency || localTargetCurrencyBackup || DEFAULT_TARGET_CURRENCY;
      }
      if (areaName === 'sync' && changes.enabled) {
        enabled = changes.enabled.newValue;
        updateListenerState();
      }
      if (areaName === 'sync' && changes.disabledSites) {
        disabledSites = changes.disabledSites.newValue;
        checkSiteEnabled();
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
          decimalPlaces = changes.decimalPlaces.newValue;
        }
        if (changes.tooltipPosition) {
          tooltipPosition = changes.tooltipPosition.newValue;
        }
        if (changes.tooltipTheme) {
          tooltipTheme = changes.tooltipTheme.newValue;
        }
      }
    });
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
