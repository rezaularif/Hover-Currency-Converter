# Changelog

All notable changes to this project are documented in this file.

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
