(function(root) {
  const AMOUNT_PATTERN = String.raw`\d(?:[\d.,'’\u00a0\u202f ]*\d)?`;

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function parseLocalizedAmount(value) {
    if (typeof value !== 'string') return null;

    const compact = value.replace(/[\s\u00a0\u202f'’]/g, '');
    if (!/^\d+(?:[.,]\d+)*$/.test(compact)) return null;

    const lastDot = compact.lastIndexOf('.');
    const lastComma = compact.lastIndexOf(',');
    let normalized = compact;

    if (lastDot !== -1 && lastComma !== -1) {
      const decimalSeparator = lastDot > lastComma ? '.' : ',';
      const groupingSeparator = decimalSeparator === '.' ? ',' : '.';
      normalized = compact.split(groupingSeparator).join('');
      if (decimalSeparator === ',') {
        normalized = normalized.replace(',', '.');
      }
    } else if (lastDot !== -1 || lastComma !== -1) {
      const separator = lastDot !== -1 ? '.' : ',';
      const groups = compact.split(separator);
      const fractionLength = groups.at(-1).length;
      const isWesternGroupedInteger = groups[0].length <= 3
        && fractionLength === 3
        && groups.slice(1).every(group => group.length === 3);
      const isIndianGroupedInteger = groups.length > 2
        && groups[0].length <= 2
        && fractionLength === 3
        && groups.slice(1, -1).every(group => group.length === 2);

      if (isWesternGroupedInteger || isIndianGroupedInteger) {
        normalized = groups.join('');
      } else if (groups.length === 2) {
        normalized = `${groups[0]}.${groups[1]}`;
      } else {
        return null;
      }
    }

    const amount = Number(normalized);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
  }

  function createCurrencyParser({ symbolToCurrency, validCurrencyCodes }) {
    const symbolPattern = Object.keys(symbolToCurrency)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|');
    const symbolBefore = new RegExp(`(${symbolPattern})\\s*(${AMOUNT_PATTERN})`);
    const symbolAfter = new RegExp(`(${AMOUNT_PATTERN})\\s*(${symbolPattern})`);
    const codeBefore = new RegExp(`\\b([A-Z]{3})\\s*(${AMOUNT_PATTERN})`);
    const codeAfter = new RegExp(`(${AMOUNT_PATTERN})\\s*([A-Z]{3})\\b`);

    return function parseCurrency(text) {
      let match;
      let currency;
      let rawAmount;

      if ((match = text.match(symbolBefore))) {
        currency = symbolToCurrency[match[1]];
        rawAmount = match[2];
      } else if ((match = text.match(symbolAfter))) {
        currency = symbolToCurrency[match[2]];
        rawAmount = match[1];
      } else if ((match = text.match(codeBefore))) {
        currency = match[1];
        rawAmount = match[2];
      } else if ((match = text.match(codeAfter))) {
        currency = match[2];
        rawAmount = match[1];
      }

      if (!currency || !validCurrencyCodes.has(currency)) return null;

      const amount = parseLocalizedAmount(rawAmount);
      return amount === null ? null : { currency, amount };
    };
  }

  root.HCCCurrencyParser = Object.freeze({ createCurrencyParser, parseLocalizedAmount });
})(globalThis);
