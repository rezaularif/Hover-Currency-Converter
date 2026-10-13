(function(root) {
  const AMOUNT_PATTERN = String.raw`\d(?:[\d.,'’\u00a0\u202f ]*\d)?`;
  const LATIN_LETTER = String.raw`[A-Za-z\u00C0-\u024F]`;
  const STARTS_WITH_LETTER = new RegExp(`^${LATIN_LETTER}`);
  const ENDS_WITH_LETTER = new RegExp(`${LATIN_LETTER}$`);

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

  function buildSymbolPattern(symbols) {
    const groups = { both: [], before: [], after: [], none: [] };
    for (const symbol of [...symbols].sort((a, b) => b.length - a.length)) {
      const starts = STARTS_WITH_LETTER.test(symbol);
      const ends = ENDS_WITH_LETTER.test(symbol);
      const group = starts && ends ? 'both' : starts ? 'before' : ends ? 'after' : 'none';
      groups[group].push(escapeRegExp(symbol));
    }
    const notBefore = `(?<!${LATIN_LETTER})`;
    const notAfter = `(?!${LATIN_LETTER})`;
    return [
      groups.before.length && `${notBefore}(?:${groups.before.join('|')})`,
      groups.both.length && `${notBefore}(?:${groups.both.join('|')})${notAfter}`,
      groups.after.length && `(?:${groups.after.join('|')})${notAfter}`,
      groups.none.length && groups.none.join('|')
    ].filter(Boolean).join('|');
  }

  function createCurrencyParser({ symbolToCurrency, ambiguousSymbols = {}, validCurrencyCodes }) {
    const symbolPattern = buildSymbolPattern([...Object.keys(symbolToCurrency), ...Object.keys(ambiguousSymbols)]);
    const symbolBefore = new RegExp(`(${symbolPattern})\\s*(${AMOUNT_PATTERN})`);
    const symbolAfter = new RegExp(`(${AMOUNT_PATTERN})\\s*(${symbolPattern})`);
    const codeBefore = new RegExp(`\\b([A-Z]{3})\\s*(${AMOUNT_PATTERN})`);
    const codeAfter = new RegExp(`(${AMOUNT_PATTERN})\\s*([A-Z]{3})\\b`);

    return function parseCurrency(text) {
      let match;
      let symbol;
      let currency;
      let rawAmount;

      if ((match = text.match(symbolBefore))) {
        symbol = match[1];
        rawAmount = match[2];
      } else if ((match = text.match(symbolAfter))) {
        symbol = match[2];
        rawAmount = match[1];
      } else if ((match = text.match(codeBefore))) {
        currency = match[1];
        rawAmount = match[2];
      } else if ((match = text.match(codeAfter))) {
        currency = match[2];
        rawAmount = match[1];
      }

      if (symbol && Object.hasOwn(ambiguousSymbols, symbol)) {
        const amount = parseLocalizedAmount(rawAmount);
        return amount === null ? null : { symbol: ambiguousSymbols[symbol], amount };
      }
      if (symbol) currency = symbolToCurrency[symbol];
      if (!currency || !validCurrencyCodes.has(currency)) return null;

      const amount = parseLocalizedAmount(rawAmount);
      return amount === null ? null : { currency, amount };
    };
  }

  root.HCCCurrencyParser = Object.freeze({ createCurrencyParser, parseLocalizedAmount });
})(globalThis);
