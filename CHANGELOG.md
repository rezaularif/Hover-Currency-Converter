# Changelog

All notable changes to this project are documented in this file.

## [1.1.1] - 2026-10-15

### Fixed
- Preserved split-element prices when currency symbols and amounts are separated across child nodes (e.g., `<span>$</span><span>19</span><span>99</span>`).
- Rejected malformed or unusable exchange-rate and currency-list payloads before caching, falling back cleanly to the secondary CDN or cached data.
- Preserved the cached rate timestamp in the side panel when a background refresh falls back to stale cache.

## [1.1.0] - 2026-10-14

Highlights: shared currency symbols such as `kr`, `$` and `¥` are now detected correctly, you can tell the extension which currency a site uses, the Quick Convert currency is searchable, and hovering is much lighter on busy pages.

### Added
- **Smarter detection of shared symbols.** `$`, `£`, `¥`, `kr`, `Rs`, `﷼`, `元`, `C$` and `B$` are each used by several currencies. The extension now works out which one a price uses from the price element, the page's product data (`priceCurrency`), the URL's currency or locale, the site's country domain, and the page language. When a page gives no clue, `kr`, `¥` and similar symbols are treated as your own currency, so local prices are no longer converted by mistake.
- **Currency Detection settings in the side panel.** Choose the currency a site uses ("Prices on example.dk"), or set a default for each shared symbol. Both settings sync across your signed-in browsers.
- **Searchable Quick Convert currency.** The Quick Convert currency uses the same dropdown as Target Currency: search by code or name, full currency names, and keyboard navigation, instead of a long system list.
- New price formats: `kr. 1.299,00`, `Rs. 1,499`, `CN¥`, `JP¥`, `RMB`, `円`, `元`, `E£` and `Mex$`.
- A small "Buy me a coffee" link at the bottom of the side panel. The button image ships with the extension, so nothing is loaded from other sites.

### Fixed
- Danish, Norwegian and Icelandic prices written with `kr` were read as Swedish kronor, so they were converted with the wrong rate, or converted even when already in the user's currency.
- Words that start with a currency abbreviation, such as `5 krabber` or `Mrs 5`, are no longer treated as prices.
- The side panel now follows tab switches and page navigation, and per-site settings always apply to the site shown.
- Setting changes made while a page is still loading are no longer missed.
- Long converted amounts no longer get cut off at the edge of the window.

### Improved
- **Much lighter hovering.** The extension no longer changes the page's own elements while you hover: the highlight is drawn as a separate overlay, and the tooltip moves on its own layer and reuses its elements. On a 27,000-element test page, hover-related layout work fell from 693 passes to 45, style recalculations from 1,355 to 124, and repaint time by about 90% compared with 1.0.9.
- **Fewer accidental tooltips.** A price is matched from the hovered element or a small surrounding container, so hovering a product title or button no longer converts the whole card's price. On dense product grids this cut tooltip appearances by more than 90%.
- **Faster tooltips.** Hover-to-tooltip time dropped from about 9 ms to about 2 ms.
- **Less memory.** No tooltip elements are added to a page until the first conversion, pointer listeners are attached only while a tooltip is showing, text reading stops early and creates no page objects, and the price parser uses about 100 KB less memory per tab.
- **Lighter side panel.** Both currency lists are built only when opened, and the shared-symbol defaults only when expanded: 193 elements at startup instead of 683, and 41 event listeners instead of 222.
- Number formatting is cached in the tooltip, Quick Convert, and the background worker.

### Changed
- Currency symbols, flags and symbol mappings now come from one shared catalog (`lib/currencies.js`). Tooltip flags for ANG and XCD now match the side panel.
- Both side panel currency pickers use one shared component (`sidepanel/currency-picker.js`).
- The background worker's fallback injection reads its file list from the manifest, so the two always match.
- No new permissions, tracking, or data collection.

## [1.0.9] - 2026-09-07

### Fixed
- Prevented delayed conversion replies from showing outdated hover and quick-converter results.
- Invalidated pending tooltips when dismissed, disabled, or affected by preference changes.
- Rejected invalid amounts, currency identifiers, corrupt rates, and nonfinite conversion results.
- Handled messaging and storage failures without leaving conversion requests unanswered.
- Corrected missing decimal-preference normalization and IPv4 site matching.

### Improved
- Centralized settings defaults, normalization, and site matching across extension contexts.
- Shared hover and keyboard conversion handling and removed delayed mouseover work.
- Added regression tests for asynchronous interactions, rate caching, API fallback, and offline failures.
- Preserved the existing UI, permissions, and dependency-free MV3 architecture.

## [1.0.8] - 2026-08-13

### Fixed
- Correctly parse decimal-comma prices such as `€10,39` without treating them as values 100 times larger.
- Improved parsing for European, US, Indian, spaced, symbol-after, and ISO-code price formats.
- Added resilient exchange-rate and currency-list requests with timeouts, exponential backoff, and cached fallbacks.
- Hardened corrupted-setting recovery, unavailable-currency states, and result-gradient fallback behavior.
- Corrected shared-currency flag presentation for ANG and XCD.

### Improved
- Added searchable currency selection, native source selection, accessible controls, expanded tooltip themes, and additional result gradients.
- Kept global and per-site enable controls synchronized using the active website's dynamically detected root domain.
- Simplified duplicated settings, theme, flag, and currency metadata logic while preserving existing functionality.
- Added automated parser, network, settings, gradient-coverage, and browser stress-test fixtures.

## [1.0.7] - 2026-03-06

### Fixed
- Repaired invalid stored settings during extension updates instead of only filling missing values.
- Hardened side-panel preference loading so invalid decimal places, tooltip positions, themes, and gradients fall back to safe defaults.
- Sanitized malformed `disabledSites` data before site-toggle reads and writes to prevent panel breakage from corrupted sync storage.

### Improved
- Centralized settings normalization and repair rules into a shared module used by both the background worker and side panel.
- Added regression tests covering storage repair for currencies, display preferences, and disabled-site lists.

## [1.0.6] - 2026-02-15

### Fixed
- Hover tooltip decimal rendering now follows the user-selected `Decimal places` preference.
- Improved local symbol-aware parsing to correctly detect multi-character currency symbols such as `R$`, `A$`, `C$`, `HK$`, and `NZ$`.
- Added network timeouts to exchange-rate fetch retries to prevent long stalls when providers hang.
- Added graceful side-panel fallback when currency list loading fails (clear status, disabled selectors, no broken state).
- Updated target/source custom dropdown accessibility state by syncing `aria-expanded` during open/close.

### Improved
- Added normalization for stored tooltip and result-gradient preference values to avoid invalid class application.

## [1.0.5] - 2026-02-08

### Fixed
- Prevented settings from being overwritten on extension update.
- Hardened target/source currency persistence to avoid unexpected reset to defaults.
- Added sync-to-local backup strategy for currency preferences and automatic self-healing.
- Fixed per-site enable/disable matching for multi-part TLD domains (for example `co.uk`, `com.au`).
- Corrected currency flag mappings for `LAK` and `NIO`.
- Fixed missing flag display by adding a derived country-flag fallback for unsupported/legacy fiat codes.

### Improved
- Reduced redundant content script/CSS injection by ping-checking before manual injection.
- Tightened selectable currency filtering to exclude non-fiat/crypto-style tickers.
- Added TTL-based caching for fetched currency metadata in side panel initialization.

### Cleanup
- Removed unused `utils/currencies.js`.
- Removed dead legacy sidepanel select styles and stale handlers.
- Updated documentation references and version badges.
