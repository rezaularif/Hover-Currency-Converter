# Privacy Policy — Hover Currency Converter

**Effective date:** 2026-01-05  

Hover Currency Converter ("the extension") is a Chrome extension that detects currency amounts on web pages you visit and shows a converted value in a tooltip. This policy explains what data the extension handles.

## Data We Collect
**We do not collect personal data.**  
The extension does not collect, transmit, sell, or share personal or sensitive user data.

## Data We Process (On Your Device)
The extension processes limited page text **locally in your browser** in order to detect currency values (e.g., `$19.99`, `19.99 USD`) and show a conversion tooltip.

## Data Stored
The extension stores:
- **User settings** (e.g., enabled/disabled, selected target currency, tooltip preferences) in Chrome storage.
- **Cached exchange rates** (and a timestamp) in Chrome storage to reduce network requests.

This data stays on your device inside Chrome extension storage.

## Network Requests
To convert currencies, the extension downloads exchange-rate data from a public currency API:
- `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@*/*`
- `https://*.currency-api.pages.dev/*`

These requests are made by the extension and **do not include personal information** (no account IDs, no browsing history, no page contents). The extension requests generic endpoints such as currency rate JSON (e.g., `.../currencies/usd.json`) and a currency list JSON.

## Cookies / Tracking
The extension does not use cookies, trackers, analytics, fingerprinting, or advertising technology.

## Third-Party Services
The extension relies on the third-party currency API listed above only to retrieve exchange rates and currency metadata. Your use of that API may also be subject to their policies.

## Children’s Privacy
The extension is not directed to children under 13 and does not knowingly collect personal information.

## Changes to This Policy
If the extension’s data practices change, this policy will be updated and the effective date revised.

## Contact
If you have questions about this policy, contact:
- **Email:** hi@rezaularif.com
- **Chrome Web Store:** [Hover Currency Converter](https://chromewebstore.google.com/detail/hover-currency-converter/plbdgcecigogedfihfmabohdbbbokfka)
- **GitHub Repository:** [rezaularif/Hover-Currency-Converter](https://github.com/rezaularif/Hover-Currency-Converter)


