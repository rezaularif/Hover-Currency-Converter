(function() {
  // Prevent double initialization
  if (window.__hccInitialized) return;
  window.__hccInitialized = true;

  // Currency symbols only (removed unused 'name' field to save memory)
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
    LAK: '🇱🇷 ₭', LBP: '🇱🇧 ل.ل', LKR: '🇱🇰 Rs', LRD: '🇱🇷 $', LSL: '🇱🇸 L',
    LYD: '🇱🇾 ل.د', MAD: '🇲🇦 د.م.', MDL: '🇲🇩 L', MGA: '🇲🇬 Ar', MKD: '🇲🇰 ден',
    MMK: '🇲🇲 K', MNT: '🇲🇳 ₮', MOP: '🇲🇴 P', MRU: '🇲🇷 UM', MUR: '🇲🇺 Rs',
    MVR: '🇲🇻 .MRf', MWK: '🇲🇼 MK', MXN: '🇲🇽 $', MYR: '🇲🇾 RM', MZN: '🇲🇿 MT',
    NAD: '🇳🇦 $', NGN: '🇳🇬 ₦', NIO: '🇳🇪 C$', NOK: '🇳🇴 kr', NPR: '🇳🇵 Rs',
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

  // Expanded symbol to currency mapping (including additional symbols)
  const SYMBOL_TO_CURRENCY = {
    '$': 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR',
    '₩': 'KRW', '₺': 'TRY', '฿': 'THB', '₱': 'PHP', '₪': 'ILS',
    '৳': 'BDT', '₨': 'PKR', '₽': 'RUB', '₸': 'KZT', '₮': 'MNT',
    '₭': 'LAK', '₾': 'GEL', '₦': 'NGN', '₲': 'PYG', '₴': 'UAH',
    '₫': 'VND', '₡': 'CRC', '₵': 'GHS', '﷼': 'SAR', 'R$': 'BRL',
    'zł': 'PLN', 'Kč': 'CZK', 'kr': 'SEK', 'CHF': 'CHF'
  };

  // Valid currency codes for validation
  const VALID_CURRENCY_CODES = new Set(Object.keys(CURRENCY_SYMBOLS));

  // Pre-compiled regex patterns for US format (1,234.56)
  const REGEX_SYMBOL_BEFORE = /([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])\s*([\d,]+(?:\.\d{1,2})?)/;
  const REGEX_SYMBOL_AFTER = /([\d,]+(?:\.\d{1,2})?)\s*([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])/;
  const REGEX_CODE_AFTER = /([\d,]+(?:\.\d{1,2})?)\s*([A-Z]{3})\b/;
  const REGEX_CODE_BEFORE = /\b([A-Z]{3})\s*([\d,]+(?:\.\d{1,2})?)/;

  // Pre-compiled regex patterns for European format (1.234,56)
  const REGEX_SYMBOL_BEFORE_EU = /([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])\s*([\d.]+(?:,\d{1,2})?)/;
  const REGEX_SYMBOL_AFTER_EU = /([\d.]+(?:,\d{1,2})?)\s*([$€£¥₹₩₺฿₱₪৳₨₽₸₮₭₾₦₲₴₫₡₵﷼])/;
  const REGEX_CODE_AFTER_EU = /([\d.]+(?:,\d{1,2})?)\s*([A-Z]{3})\b/;
  const REGEX_CODE_BEFORE_EU = /\b([A-Z]{3})\s*([\d.]+(?:,\d{1,2})?)/;
 
  let tooltip = null;
  let targetCurrency = 'EUR';
  let enabled = true;
  let currentElement = null;
  let pendingRequest = null;
  let decimalPlaces = 2;
  let tooltipPosition = 'below';
  let tooltipTheme = 'purple-gradient';
  let lastMoveTime = 0;
  let listenersAttached = false;
  let hideTimeout = null;

  // Throttle utility for mouseover (faster than debounce for responsiveness)
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

    // Use server-provided decimals (ISO 4217) if available, otherwise fall back to user preference
    const displayDecimals = serverDecimals !== undefined ? serverDecimals : decimalPlaces;

    // Security: Use textContent instead of innerHTML to prevent XSS
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

    // Boundary checks to keep tooltip on screen
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

    // Update position and theme classes
    tooltip.classList.remove('hcc-pos-above', 'hcc-pos-below', 'hcc-pos-left', 'hcc-pos-right');
    tooltip.classList.add(`hcc-pos-${tooltipPosition}`);

    // Apply theme (remove old theme classes, add current)
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

    // Try US format first (1,234.56)
    // Symbol before amount: $100
    if ((match = text.match(REGEX_SYMBOL_BEFORE))) {
      currency = SYMBOL_TO_CURRENCY[match[1]];
      amount = parseFloat(match[2].replace(/,/g, ''));
    } 
    // Symbol after amount: 100$
    else if ((match = text.match(REGEX_SYMBOL_AFTER))) {
      currency = SYMBOL_TO_CURRENCY[match[2]];
      amount = parseFloat(match[1].replace(/,/g, ''));
    } 
    // Code before amount: USD 100
    else if ((match = text.match(REGEX_CODE_BEFORE))) {
      currency = match[1];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[2].replace(/,/g, ''));
    }
    // Code after amount: 100 USD
    else if ((match = text.match(REGEX_CODE_AFTER))) {
      currency = match[2];
      if (!VALID_CURRENCY_CODES.has(currency)) currency = null;
      amount = parseFloat(match[1].replace(/,/g, ''));
    }
    // Try European format (1.234,56) - only if US format didn't match
    else if ((match = text.match(REGEX_SYMBOL_BEFORE_EU))) {
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
    // First, try to find currency in the element's own text (excluding children)
    // This is more accurate for nested structures
    const directText = getDirectTextContent(element);
    if (directText && directText.length <= 50) {
      const parsed = parseCurrency(directText);
      if (parsed) return parsed;
    }

    // Check element and ancestors up to 3 levels
    let current = element;
    let depth = 0;
    const maxDepth = 3;

    while (current && current !== document.body && depth < maxDepth) {
      const text = current.textContent?.trim();
      // Check up to 200 characters
      if (text && text.length <= 200) {
        const parsed = parseCurrency(text);
        if (parsed) return parsed;
      }
      current = current.parentElement;
      depth++;
    }
    return null;
  }

  // Get only direct text content of an element (not from children)
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
    if (!enabled) return;

    // Cancel pending hide when re-entering
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
      // Debounce: delay hide by 100ms to prevent flickering
      hideTimeout = setTimeout(() => {
        hideTooltip();
        hideTimeout = null;
      }, 100);
    }
  }
 
  function handleMouseMove(e) {
    if (!tooltip || !tooltip.classList.contains('visible') || !currentElement) return;

    // Throttle to ~60fps (16ms) to reduce CPU usage
    const now = Date.now();
    if (now - lastMoveTime < 16) return;
    lastMoveTime = now;

    positionTooltip(e.clientX, e.clientY);

    // Use bounding box for more reliable cursor position detection
    const rect = currentElement.getBoundingClientRect();
    const inBounds = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );

    if (!inBounds) {
      // Also verify with elementFromPoint as fallback
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderCursor !== currentElement && !currentElement.contains(elementUnderCursor)) {
        hideTooltip();
        pendingRequest = null;
      }
    }
  }

  // Keyboard accessibility: handle focus events for screen readers and keyboard users
  function handleFocus(e) {
    if (!enabled) return;

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
    if (!enabled) return;

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

  // Use throttle instead of debounce for faster response (50ms)
  let throttledMouseOver = null;

  function attachListeners() {
    if (listenersAttached) return;
    createTooltip();

    // Use throttle for faster response (50ms)
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

  function init() {
    // Load all settings in one call with defaults
    chrome.storage.sync.get({
      targetCurrency: 'EUR',
      enabled: true
    }, (result) => {
      targetCurrency = result.targetCurrency;
      enabled = result.enabled;

      if (enabled) {
        attachListeners();
      }
    });

    // Load local preferences with defaults
    chrome.storage.local.get({
      decimalPlaces: 2,
      tooltipPosition: 'below',
      tooltipTheme: 'purple-gradient'
    }, (result) => {
      decimalPlaces = result.decimalPlaces;
      tooltipPosition = result.tooltipPosition;
      tooltipTheme = result.tooltipTheme;
    });

    // Listen for changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes.targetCurrency) {
        targetCurrency = changes.targetCurrency.newValue;
      }
      if (changes.enabled) {
        enabled = changes.enabled.newValue;
        if (enabled) {
          attachListeners();
        } else {
          detachListeners();
        }
      }

      if (areaName === 'local') {
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
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
