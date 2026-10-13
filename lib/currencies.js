(function(root) {
  const CURRENCY_SYMBOLS = Object.freeze({
    AED: 'د.إ', AFN: 'Af', ALL: 'L', AMD: '֏', ANG: 'ƒ', AOA: 'Kz', ARS: '$', AUD: 'A$', AWG: 'ƒ', AZN: '₼',
    BAM: 'KM', BBD: '$', BDT: '৳', BGN: 'лв', BHD: '.د.ب', BIF: 'Fr', BMD: '$', BND: '$', BOB: 'Bs', BRL: 'R$',
    BSD: '$', BTN: 'Nu.', BWP: 'P', BYN: 'Br', BZD: '$', CAD: 'C$', CDF: 'Fr', CHF: 'CHF', CLP: '$', CNY: '¥',
    COP: '$', CRC: '₡', CUP: '$', CVE: '$', CZK: 'Kč', DJF: 'Fr', DKK: 'kr', DOP: '$', DZD: 'د.ج', EGP: 'E£',
    ERN: 'Nfk', ETB: 'Br', EUR: '€', FJD: '$', FKP: '£', GBP: '£', GEL: '₾', GHS: '₵', GIP: '£', GMD: 'D',
    GNF: 'Fr', GTQ: 'Q', GYD: '$', HKD: 'HK$', HNL: 'L', HRK: 'kn', HTG: 'G', HUF: 'Ft', IDR: 'Rp', ILS: '₪',
    INR: '₹', IQD: 'ع.د', IRR: '﷼', ISK: 'kr', JMD: '$', JOD: 'د.ا', JPY: '¥', KES: 'KSh', KGS: 'сом', KHR: '៛',
    KMF: 'Fr', KRW: '₩', KWD: 'د.ك', KYD: '$', KZT: '₸', LAK: '₭', LBP: 'ل.ل', LKR: 'Rs', LRD: '$', LSL: 'L',
    LYD: 'ل.د', MAD: 'د.م.', MDL: 'L', MGA: 'Ar', MKD: 'ден', MMK: 'K', MNT: '₮', MOP: 'P', MRU: 'UM', MUR: 'Rs',
    MVR: '.MRf', MWK: 'MK', MXN: '$', MYR: 'RM', MZN: 'MT', NAD: '$', NGN: '₦', NIO: 'C$', NOK: 'kr', NPR: 'Rs',
    NZD: 'NZ$', OMR: 'ر.ع.', PAB: 'B/.', PEN: 'S/', PGK: 'K', PHP: '₱', PKR: '₨', PLN: 'zł', PYG: '₲', QAR: 'ر.ق',
    RON: 'lei', RSD: 'дин.', RUB: '₽', RWF: 'Fr', SAR: 'ر.س', SBD: '$', SCR: 'Rs', SDG: 'ج.س.', SEK: 'kr', SGD: '$',
    SHP: '£', SLE: 'Le', SLL: 'Le', SOS: 'Sh', SRD: '$', SSP: '£', STD: 'Db', STN: 'Db', SYP: '£', SZL: 'E',
    THB: '฿', TJS: 'SM', TMT: 'm', TND: 'د.ت', TOP: 'T$', TRY: '₺', TTD: '$', TWD: '$', TZS: 'Sh', UAH: '₴',
    UGX: 'USh', USD: '$', UYU: '$', UZS: 'so\'m', VES: 'Bs.S', VND: '₫', VUV: 'VT', WST: 'T', XAF: 'Fr', XCD: '$',
    XDR: 'SDR', XOF: 'Fr', XPF: 'Fr', YER: '﷼', ZAR: 'R', ZMW: 'ZK', ZWL: '$'
  });

  const SYMBOL_TO_CURRENCY = Object.freeze({
    'US$': 'USD', 'CA$': 'CAD', 'A$': 'AUD', 'AU$': 'AUD',
    'NZ$': 'NZD', 'HK$': 'HKD', 'S$': 'SGD', 'SG$': 'SGD', 'MX$': 'MXN', 'Mex$': 'MXN',
    'AR$': 'ARS', 'CLP$': 'CLP', 'COL$': 'COP', 'RD$': 'DOP', 'TT$': 'TTD',
    'J$': 'JMD', 'EC$': 'XCD', 'NT$': 'TWD', 'R$': 'BRL',
    'CN¥': 'CNY', 'JP¥': 'JPY', 'RMB': 'CNY', '円': 'JPY', 'E£': 'EGP',
    '€': 'EUR', '₹': 'INR',
    '₩': 'KRW', '₺': 'TRY', '฿': 'THB', '₱': 'PHP', '₪': 'ILS',
    '৳': 'BDT', '₽': 'RUB', '₸': 'KZT', '₮': 'MNT', '₭': 'LAK',
    '₾': 'GEL', '₦': 'NGN', '₲': 'PYG', '₴': 'UAH', '₫': 'VND', '₡': 'CRC',
    '₵': 'GHS',
    'zł': 'PLN', 'Kč': 'CZK', 'CHF': 'CHF'
  });

  const FLAG_OVERRIDES = Object.freeze({
    ANG: '🇨🇼', XAF: '🇨🇲', XCD: '🌐', XDR: '🌐', XOF: '🇧🇯', XPF: '🇵🇫'
  });

  const SUPPORTED_CURRENCIES = new Set(Object.keys(CURRENCY_SYMBOLS));
  const REGIONAL_INDICATOR_OFFSET = 127397;

  function getFlag(code) {
    const upperCode = String(code).toUpperCase();
    if (Object.hasOwn(FLAG_OVERRIDES, upperCode)) return FLAG_OVERRIDES[upperCode];
    const region = upperCode.slice(0, 2);
    if (!/^[A-Z]{2}$/.test(region)) return '💱';
    return String.fromCodePoint(
      region.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET,
      region.charCodeAt(1) + REGIONAL_INDICATOR_OFFSET
    );
  }

  function getCurrencyLabel(code) {
    const symbol = Object.hasOwn(CURRENCY_SYMBOLS, code) ? CURRENCY_SYMBOLS[code] : code;
    return `${getFlag(code)} ${symbol}`;
  }

  root.HCCCurrencies = Object.freeze({
    CURRENCY_SYMBOLS,
    SYMBOL_TO_CURRENCY,
    SUPPORTED_CURRENCIES,
    getFlag,
    getCurrencyLabel
  });
})(globalThis);