# Changelog

All notable changes to this project are documented in this file.

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
