(function(root) {
  function normalizeDisabledSites(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    const normalized = [];
    const seen = new Set();

    for (const site of value) {
      if (typeof site !== 'string') {
        continue;
      }

      const cleaned = site.trim().toLowerCase();
      if (!cleaned || seen.has(cleaned)) {
        continue;
      }

      seen.add(cleaned);
      normalized.push(cleaned);
    }

    return normalized;
  }

  root.HCCSettingsCore = Object.freeze({ normalizeDisabledSites });
})(globalThis);
