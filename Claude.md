# Claude AI Context - Hover Currency Converter

This document provides context about the Hover Currency Converter Chrome extension for Claude AI assistance.

## Project Overview

Hover Currency Converter is a Chrome extension that allows users to instantly see currency conversions by hovering over prices on any website. The extension uses Chrome's Manifest V3 and provides a clean, privacy-focused experience.

## Core Functionality

### 1. Price Detection (content/content.js)
- Detects currency patterns on web pages using regex
- Supports various formats: $19.99, €49, 19.99 USD, etc.
- Creates hover tooltips showing converted amounts
- Handles both inline prices and text-based prices

### 2. Currency Conversion (utils/currencies.js)
- Fetches exchange rates from public APIs
- Caches rates for 24 hours to minimize API calls
- Supports 150+ currencies
- Fallback API endpoints for reliability

### 3. Side Panel UI (sidepanel/)
- User settings interface
- Target currency selection
- Manual currency converter
- Enable/disable toggle

### 4. Background Service Worker (background/service-worker.js)
- Manages side panel
- Handles welcome page on first install
- Auto-injects content scripts

## Architecture

### Chrome Extension Components
- **Manifest V3** - Modern Chrome extension architecture
- **Content Scripts** - Injected into web pages for price detection
- **Service Worker** - Background processing
- **Side Panel** - Settings and manual conversion UI

### Data Flow
1. User visits a webpage
2. Content script scans for currency patterns
3. On hover, fetches exchange rate (from cache or API)
4. Displays converted amount in tooltip
5. User preferences stored in chrome.storage.local

## Key Files

- `manifest.json` - Extension configuration
- `content/content.js` - Price detection and tooltip logic
- `content/content.css` - Tooltip styling
- `background/service-worker.js` - Background tasks
- `sidepanel/sidepanel.js` - Settings UI logic
- `utils/currencies.js` - Currency utilities and API calls

## Technical Constraints

### Chrome Extension APIs
- Uses chrome.storage for settings
- Uses chrome.sidePanel for UI
- Uses chrome.scripting for content injection
- Uses chrome.runtime for messaging

### Currency Detection Patterns
- Supports major currency symbols: $, €, £, ¥, ₹, etc.
- Handles ISO codes: USD, EUR, GBP, etc.
- Recognizes various number formats: 1,234.56, 1.234,56, 1 234.56

### Exchange Rate APIs
Primary: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{from}.json`
Fallback: `https://latest.currency-api.pages.dev/v1/currencies/{from}.json`

## Privacy & Security

- No user tracking or analytics
- No personal data collection
- All processing happens locally
- Exchange rates cached locally for 24 hours
- Settings stored in chrome.storage.local only

## Development Guidelines

### Code Style
- Vanilla JavaScript (no frameworks)
- ES6+ syntax
- Async/await for API calls
- Comprehensive error handling

### Testing Considerations
- Test on various websites with different price formats
- Verify tooltip positioning and visibility
- Check API fallback mechanisms
- Validate currency conversion accuracy

### Performance
- Minimal DOM manipulation
- Efficient regex patterns
- Debounced hover events
- Cached exchange rates

## Common Tasks

### Adding New Currency Support
1. Update `currencies.js` with new currency code
2. Ensure API supports the currency
3. Test conversion accuracy

### Updating Currency Detection
1. Modify regex patterns in `content/content.js`
2. Test on various websites
3. Verify tooltip positioning

### UI Changes
1. Update HTML in `sidepanel/sidepanel.html`
2. Modify styles in `sidepanel/sidepanel.css`
3. Update logic in `sidepanel/sidepanel.js`

## Known Limitations

- Requires internet connection for initial exchange rate fetch
- Limited to currencies supported by the API
- May not detect all price formats on heavily styled pages
- Tooltip positioning may require adjustment on complex layouts

## Version History

- v1.0.4 - Added auto-injection, welcome page, improved detection
- v1.0.2 - Chrome Web Store submission
- v1.0.1 - Improved robustness and accessibility
- v1.0.0 - Initial release

## Distribution

- Published on Chrome Web Store
- Store ID: plbdgcecigogedfihfmabohdbbbokfka
- Requires Chrome browser (or Chromium-based browsers)

## Support & Contact

- Developer: Rezaul Arif
- Email: hi@rezaularif.com
- Issues: GitHub repository
