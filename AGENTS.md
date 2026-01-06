# Agent Guidelines for Hover Currency Converter

## Build/Test Commands
No build system - load extension unpacked in Chrome for development.
Manual testing required on various websites with different price formats.

## Code Style Guidelines
- **Language**: Vanilla JavaScript ES6+ (no frameworks)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CURRENCY_SYMBOLS`, `REGEX_PATTERN`)
- **Functions/Variables**: camelCase (e.g., `handleMouseOver`, `targetCurrency`)
- **No comments** in production code unless essential
- **Error handling**: Wrap async operations in try-catch with console.error
- **Security**: Always use `textContent` instead of `innerHTML` for user data
- **Chrome APIs**: Use chrome.storage.sync for user settings, chrome.storage.local for cached data
- **Content scripts**: Wrap in IIFE with double-initialization check: `if (window.__hccInitialized) return;`
- **Event listeners**: Use named functions or properly bound callbacks, avoid memory leaks
- **Throttle**: Custom throttle utility for mouse events (~50-60fps target)
- **Storage defaults**: Always provide default values in storage.get()
- **API calls**: Use async/await with exponential backoff retry logic
- **Currency detection**: Pre-compile regex patterns for performance
