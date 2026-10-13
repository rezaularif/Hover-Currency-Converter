(function(root) {
  const SYMBOL_GROUPS = Object.freeze({
    '$': Object.freeze({
      label: '$',
      symbols: ['$'],
      candidates: [
        'USD', 'CAD', 'AUD', 'NZD', 'MXN', 'SGD', 'HKD', 'TWD', 'ARS', 'CLP', 'COP', 'UYU',
        'DOP', 'CUP', 'JMD', 'TTD', 'BSD', 'BBD', 'BZD', 'BMD', 'KYD', 'XCD', 'GYD', 'SRD',
        'LRD', 'NAD', 'FJD', 'SBD', 'BND'
      ],
      fallback: 'USD',
      preferLocal: false
    }),
    '£': Object.freeze({
      label: '£',
      symbols: ['£'],
      candidates: ['GBP', 'EGP', 'GIP', 'FKP', 'SHP', 'SSP', 'SYP'],
      fallback: 'GBP',
      preferLocal: false
    }),
    '¥': Object.freeze({
      label: '¥',
      symbols: ['¥', '￥'],
      candidates: ['JPY', 'CNY'],
      fallback: 'JPY',
      preferLocal: true
    }),
    'kr': Object.freeze({
      label: 'kr',
      symbols: ['kr.', 'kr', 'Kr.', 'Kr', 'kroner', 'kronor'],
      candidates: ['SEK', 'DKK', 'NOK', 'ISK'],
      fallback: 'SEK',
      preferLocal: true
    }),
    'Rs': Object.freeze({
      label: 'Rs',
      symbols: ['₨', 'Rs.', 'Rs'],
      candidates: ['INR', 'PKR', 'LKR', 'NPR', 'MUR', 'SCR'],
      fallback: 'INR',
      preferLocal: true
    }),
    '﷼': Object.freeze({
      label: '﷼',
      symbols: ['﷼'],
      candidates: ['SAR', 'IRR', 'YER', 'OMR', 'QAR'],
      fallback: 'SAR',
      preferLocal: true
    }),
    '元': Object.freeze({
      label: '元',
      symbols: ['元'],
      candidates: ['CNY', 'TWD', 'HKD'],
      fallback: 'CNY',
      preferLocal: true
    }),
    'C$': Object.freeze({
      label: 'C$',
      symbols: ['C$'],
      candidates: ['CAD', 'NIO'],
      fallback: 'CAD',
      preferLocal: true
    }),
    'B$': Object.freeze({
      label: 'B$',
      symbols: ['B$'],
      candidates: ['BND', 'BSD'],
      fallback: 'BND',
      preferLocal: true
    })
  });

  const AMBIGUOUS_SYMBOLS = Object.freeze(Object.fromEntries(
    Object.entries(SYMBOL_GROUPS).flatMap(([key, group]) => group.symbols.map(symbol => [symbol, key]))
  ));

  const SHARED_SYMBOL_CURRENCIES = Object.freeze([
    ...new Set(Object.values(SYMBOL_GROUPS).flatMap(group => group.candidates))
  ]);

  const REGION_CURRENCIES = Object.freeze({
    US: 'USD', PR: 'USD', EC: 'USD', SV: 'USD', PA: 'USD', TL: 'USD', FM: 'USD', MH: 'USD',
    PW: 'USD', GU: 'USD', AS: 'USD', VI: 'USD', MP: 'USD', VG: 'USD', TC: 'USD', BQ: 'USD',
    CA: 'CAD', AU: 'AUD', CX: 'AUD', CC: 'AUD', NF: 'AUD', KI: 'AUD', NR: 'AUD', TV: 'AUD',
    NZ: 'NZD', CK: 'NZD', NU: 'NZD', PN: 'NZD', TK: 'NZD',
    MX: 'MXN', SG: 'SGD', HK: 'HKD', TW: 'TWD', AR: 'ARS', CL: 'CLP', CO: 'COP', UY: 'UYU',
    DO: 'DOP', CU: 'CUP', JM: 'JMD', TT: 'TTD', BS: 'BSD', BB: 'BBD', BZ: 'BZD', BM: 'BMD',
    KY: 'KYD', AG: 'XCD', AI: 'XCD', DM: 'XCD', GD: 'XCD', KN: 'XCD', LC: 'XCD', MS: 'XCD',
    VC: 'XCD', GY: 'GYD', SR: 'SRD', LR: 'LRD', NA: 'NAD', FJ: 'FJD', SB: 'SBD', BN: 'BND',
    NI: 'NIO', JP: 'JPY', CN: 'CNY',
    SE: 'SEK', DK: 'DKK', GL: 'DKK', FO: 'DKK', NO: 'NOK', SJ: 'NOK', IS: 'ISK',
    GB: 'GBP', UK: 'GBP', IM: 'GBP', JE: 'GBP', GG: 'GBP', GI: 'GIP', FK: 'FKP', SH: 'SHP',
    SS: 'SSP', SY: 'SYP', EG: 'EGP',
    IN: 'INR', PK: 'PKR', LK: 'LKR', NP: 'NPR', MU: 'MUR', SC: 'SCR',
    SA: 'SAR', IR: 'IRR', YE: 'YER', OM: 'OMR', QA: 'QAR'
  });

  const LANGUAGE_CURRENCIES = Object.freeze({
    da: 'DKK', fo: 'DKK', kl: 'DKK', sv: 'SEK', nb: 'NOK', nn: 'NOK', no: 'NOK', is: 'ISK',
    ja: 'JPY', zh: 'CNY', fa: 'IRR', ur: 'PKR', hi: 'INR', si: 'LKR', ne: 'NPR'
  });

  const GENERIC_TLDS = new Set([
    'ac', 'ag', 'ai', 'am', 'bz', 'cc', 'co', 'dm', 'do', 'fm', 'gg', 'gs', 'im', 'io', 'je',
    'la', 'ly', 'me', 'ms', 'na', 'nu', 'pw', 'sh', 'tc', 'tk', 'to', 'tv', 'vc', 'vg', 'ws'
  ]);
  const NON_REGION_SEGMENTS = new Set([
    ...GENERIC_TLDS, 'ar', 'bn', 'bs', 'gd', 'gl', 'kn', 'ky', 'sr', 'tt'
  ]);

  const CURRENCY_QUERY_PARAMS = new Set(['currency', 'curr', 'cur', 'currencycode', 'currency_code', 'selectedcurrency']);
  const LOCALE_QUERY_PARAMS = new Set(['locale', 'lang', 'language', 'hl']);
  const REGION_QUERY_PARAMS = new Set(['country', 'region', 'gl', 'market']);

  const STRUCTURED_CURRENCY_SELECTOR = [
    'meta[property="product:price:currency"]',
    'meta[property="og:price:currency"]',
    '[itemprop="priceCurrency"]'
  ].join(',');
  const JSON_LD_CURRENCY = /"priceCurrency"\s*:\s*"([A-Za-z]{3})"/g;
  const MAX_JSON_LD_SCRIPTS = 20;
  const MAX_JSON_LD_LENGTH = 200000;

  const ELEMENT_CURRENCY_ATTRIBUTES = ['data-currency', 'data-currency-code', 'data-price-currency', 'data-currencycode'];
  const MAX_ELEMENT_DEPTH = 6;

  function normalizeCode(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
  }

  function parseLocale(tag) {
    if (typeof tag !== 'string') return null;
    const [language, ...subtags] = tag.trim().replace(/_/g, '-').split('-');
    if (!/^[a-z]{2,3}$/i.test(language)) return null;
    const region = subtags.find(part => /^[a-z]{2}$/i.test(part));
    const script = subtags.find(part => /^[a-z]{4}$/i.test(part));
    return {
      language: language.toLowerCase(),
      region: region ? region.toUpperCase() : null,
      script: script ? script.toLowerCase() : null
    };
  }

  function getLocaleCurrency(tag) {
    const locale = parseLocale(tag);
    if (!locale) return null;
    if (locale.region) return REGION_CURRENCIES[locale.region] || null;
    if (locale.language === 'zh' && locale.script === 'hant') return null;
    return LANGUAGE_CURRENCIES[locale.language] || null;
  }

  function getSegmentCurrency(segment) {
    const value = segment.toLowerCase();
    if (/^[a-z]{2}[-_][a-z]{2}$/.test(value)) return getLocaleCurrency(value);
    if (!/^[a-z]{2}$/.test(value) || NON_REGION_SEGMENTS.has(value)) return null;
    return LANGUAGE_CURRENCIES[value] || REGION_CURRENCIES[value.toUpperCase()] || null;
  }

  function getQueryCurrencies(location) {
    const currencies = [];
    let params;
    try {
      params = new URLSearchParams(location.search || '');
    } catch {
      return currencies;
    }
    for (const [rawKey, value] of params) {
      const key = rawKey.toLowerCase();
      if (CURRENCY_QUERY_PARAMS.has(key)) {
        currencies.unshift(normalizeCode(value));
      } else if (LOCALE_QUERY_PARAMS.has(key)) {
        currencies.push(getLocaleCurrency(value));
      } else if (REGION_QUERY_PARAMS.has(key) && /^[a-z]{2}$/i.test(value)) {
        currencies.push(REGION_CURRENCIES[value.toUpperCase()] || null);
      }
    }
    return currencies;
  }

  function getUrlCurrencies(location) {
    const currencies = [];
    const segments = (location.pathname || '').split('/').filter(Boolean).slice(0, 2);
    for (const segment of segments) {
      const currency = getSegmentCurrency(segment);
      if (currency) {
        currencies.push(currency);
        break;
      }
    }

    const labels = (location.hostname || '').toLowerCase().replace(/\.$/, '').split('.');
    if (labels.length >= 3) {
      currencies.push(getSegmentCurrency(labels[0]));
    }
    const tld = labels.at(-1);
    if (labels.length >= 2 && /^[a-z]{2}$/.test(tld) && !GENERIC_TLDS.has(tld)) {
      currencies.push(REGION_CURRENCIES[tld.toUpperCase()] || null);
    }
    return currencies;
  }

  function getStructuredDataCurrencies(doc) {
    const counts = new Map();
    const count = value => {
      const code = normalizeCode(value);
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    };

    for (const element of doc.querySelectorAll(STRUCTURED_CURRENCY_SELECTOR)) {
      count(element.getAttribute('content') || element.textContent);
    }

    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (let index = 0; index < scripts.length && index < MAX_JSON_LD_SCRIPTS; index++) {
      const text = scripts[index].textContent || '';
      if (text.length > MAX_JSON_LD_LENGTH) continue;
      for (const match of text.matchAll(JSON_LD_CURRENCY)) count(match[1]);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([code]) => code);
  }

  function collectPageCurrencies(doc, location) {
    const currencies = [];
    const add = code => {
      if (code && !currencies.includes(code)) currencies.push(code);
    };

    try {
      getStructuredDataCurrencies(doc).forEach(add);
      getQueryCurrencies(location).forEach(add);
      getUrlCurrencies(location).forEach(add);

      const htmlLang = doc.documentElement?.getAttribute('lang') || '';
      const htmlLocale = parseLocale(htmlLang);
      if (htmlLocale?.region) add(getLocaleCurrency(htmlLang));
      add(getLocaleCurrency(doc.querySelector('meta[property="og:locale"]')?.getAttribute('content')));
      if (htmlLocale && !htmlLocale.region) add(getLocaleCurrency(htmlLang));
    } catch (error) {
      console.error('Failed to read page currency hints:', error);
    }

    return currencies;
  }

  function findElementCurrency(element) {
    let current = element;
    for (let depth = 0; current && depth < MAX_ELEMENT_DEPTH; depth++) {
      if (typeof current.getAttribute !== 'function') return null;
      for (const attribute of ELEMENT_CURRENCY_ATTRIBUTES) {
        const code = normalizeCode(current.getAttribute(attribute));
        if (code) return code;
      }
      if (current.hasAttribute?.('itemscope')) {
        const meta = current.querySelector('[itemprop="priceCurrency"]');
        const code = normalizeCode(meta?.getAttribute('content') || meta?.textContent);
        if (code) return code;
      }
      current = current.parentElement;
    }
    return null;
  }

  function getLocalCurrencies(targetCurrency, languages = []) {
    return [targetCurrency, ...Array.from(languages || [], getLocaleCurrency)].filter(Boolean);
  }

  function resolveSymbolCurrency(symbol, context = {}) {
    if (!Object.hasOwn(SYMBOL_GROUPS, symbol)) return null;
    const group = SYMBOL_GROUPS[symbol];
    const isCandidate = code => typeof code === 'string' && group.candidates.includes(code);
    const {
      siteCurrency,
      elementCurrency,
      pageCurrencies = [],
      symbolCurrency,
      localCurrencies = []
    } = context;

    if (isCandidate(siteCurrency)) return siteCurrency;
    if (isCandidate(elementCurrency)) return elementCurrency;
    const pageCurrency = pageCurrencies.find(isCandidate);
    if (pageCurrency) return pageCurrency;
    if (isCandidate(symbolCurrency)) return symbolCurrency;
    if (group.preferLocal) {
      const localCurrency = localCurrencies.find(isCandidate);
      if (localCurrency) return localCurrency;
    }
    return group.fallback;
  }

  root.HCCCurrencyDetection = Object.freeze({
    SYMBOL_GROUPS,
    AMBIGUOUS_SYMBOLS,
    SHARED_SYMBOL_CURRENCIES,
    getLocaleCurrency,
    collectPageCurrencies,
    findElementCurrency,
    getLocalCurrencies,
    resolveSymbolCurrency
  });
})(globalThis);
