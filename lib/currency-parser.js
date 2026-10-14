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

    const dotCount = (compact.match(/\./g) || []).length;
    const commaCount = (compact.match(/,/g) || []).length;
    const lastDot = compact.lastIndexOf('.');
    const lastComma = compact.lastIndexOf(',');
    let normalized = compact;

    if (lastDot !== -1 && lastComma !== -1) {
      const decimalSeparator = lastDot > lastComma ? '.' : ',';
      const decimalCount = decimalSeparator === '.' ? dotCount : commaCount;
      if (decimalCount > 1) return null;
      const groupingSeparator = decimalSeparator === '.' ? ',' : '.';
      const [integerPart, fractionPart] = compact.split(decimalSeparator);
      const groups = integerPart.split(groupingSeparator);
      const isWesternGrouped = groups[0].length <= 3 && groups.slice(1).every(group => group.length === 3);
      const isIndianGrouped = groups.length > 2
        && groups[0].length <= 2
        && groups.at(-1).length === 3
        && groups.slice(1, -1).every(group => group.length === 2);
      if (!isWesternGrouped && !isIndianGrouped) return null;
      normalized = `${groups.join('')}.${fractionPart}`;
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
    const patterns = [
      [new RegExp(`(${symbolPattern})\\s*(${AMOUNT_PATTERN})`, 'g'), 1, 2, true],
      [new RegExp(`(${AMOUNT_PATTERN})\\s*(${symbolPattern})`, 'g'), 2, 1, true],
      [new RegExp(`\\b([A-Z]{3})\\s*(${AMOUNT_PATTERN})`, 'g'), 1, 2, false],
      [new RegExp(`(${AMOUNT_PATTERN})\\s*([A-Z]{3})\\b`, 'g'), 2, 1, false]
    ];

    return function parseCurrency(text) {
      for (const [pattern, tokenIndex, amountIndex, isSymbol] of patterns) {
        for (const match of text.matchAll(pattern)) {
          const token = match[tokenIndex];
          const amount = parseLocalizedAmount(match[amountIndex]);
          if (amount === null) continue;
          if (isSymbol && Object.hasOwn(ambiguousSymbols, token)) {
            return { symbol: ambiguousSymbols[token], amount };
          }
          const currency = isSymbol ? symbolToCurrency[token] : token;
          if (currency && validCurrencyCodes.has(currency)) {
            return { currency, amount };
          }
        }
      }
      return null;
    };
  }

  root.HCCCurrencyParser = Object.freeze({ createCurrencyParser, parseLocalizedAmount });
})(globalThis);
