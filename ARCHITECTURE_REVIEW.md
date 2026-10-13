# Architecture review

## Keep the small MV3 architecture

The service worker, content script, and side panel are useful browser-enforced boundaries. Keep vanilla JavaScript, native Chrome APIs, and the existing no-build installation. A framework, generic repository layer, dependency injection container, or global state library would add more complexity than it removes here.

## Implemented in this pass

- **One settings policy:** `lib/settings-core.js` now owns defaults, validation, and domain matching. `lib/settings.js` is an ES-module adapter rather than a second implementation. This reuses the existing classic-script bridge without adding loading machinery or permissions.
- **One tooltip conversion path:** hover and keyboard focus share `convertElement`. Each interaction has a request generation; old replies cannot revive dismissed tooltips or label a previous conversion with a new target currency. Hide, disable, Escape, and relevant preference changes invalidate pending replies.
- **No delayed mouseover queue:** mouseover handles the current event directly. The existing 16ms mousemove guard remains. Removing trailing mouseover timers avoids work executing after the pointer has moved or listeners have detached.
- **Latest quick conversion wins:** the panel invalidates outstanding replies on every input, including clearing the amount, and handles messaging failures.
- **Validated conversion boundary:** the worker rejects nonfinite/nonpositive amounts, invalid currency identifiers, missing or corrupt rates, and nonfinite results. Storage failures return an error response rather than leaving a rejected request unhandled.
- **Shared settings edge cases:** missing/empty/boolean decimal preferences no longer become zero through numeric coercion; IPv4 addresses no longer acquire unrelated two-label legacy site keys.
- **Regression coverage:** built-in `node:test`, with Chrome/DOM mocks for lifecycle tests, plus real unpacked-extension checks in Ego. No added dependencies or build step.

## Recommended next changes, in order

### 1. Clarify site-disable semantics before changing the algorithm

`lib/settings-core.js` still uses a short multipart-suffix list and accepts legacy keys such as `co.uk`. An old `co.uk` entry can therefore disable unrelated UK sites, and private suffixes such as `github.io` are not distinguished. This compatibility behavior was deliberately preserved for domains rather than silently migrating user preferences.

Choose either exact-host disabling (simplest, but changes the product behavior) or registrable-domain disabling using maintained Public Suffix List data. Add an explicit migration/confirmation for broad legacy entries. Centralization now makes this a single policy change instead of two divergent fixes.

### 2. Refresh the panel's site context when the active tab changes

Implemented: the panel re-resolves the active tab on `tabs.onActivated` and `tabs.onUpdated`, ignores out-of-order lookups, and captures the site before each queued storage write. It still relies on the existing tab URL visibility rather than adding the `tabs` permission.

### 3. Consolidate currency metadata, not the whole UI

Partly implemented: `lib/currencies.js` is now the single catalog of supported codes, symbols, flags, and unambiguous symbol mappings, shared by the content script and side panel. The searchable picker has been extracted into `sidepanel/currency-picker.js` (search and keyboard behavior kept) and is used for both the target and Quick Convert currencies. The side panel still builds its selectable list from `Intl.supportedValuesOf('currency')`, API names, and fiat/crypto heuristics, so the selectable list and the hover-supported list can still differ.

### 4. Make rate freshness and provider validation explicit

The worker can serve stale cached rates while offline, but its message contract does not say whether a result is stale. The panel's status is based on a storage snapshot taken during startup, not necessarily the rates used for the displayed conversion. Return freshness metadata with conversions and label stale results clearly.

Validate the overall provider payload before promoting it to the cache; filtering invalid individual rates and rejecting invalid conversions is not a complete schema check. Also consider sharing provider fallback behavior with the panel's currency-list fetch, which currently uses only the primary provider. Preserve the worker's single in-flight request and offline cache rather than introducing a generic caching framework.

### 5. Test tooltip geometry and parser ambiguity separately

`content/overlay.js` measures the tooltip once per show and positions it with `translate` on its own compositor layer; the highlight is an overlay box, so hovering never repaints the page's own layer. Add narrow-viewport and large-amount browser tests.

Shared symbols (`$`, `£`, `¥`, `kr`, `Rs`, `﷼`, `元`, `C$`, `B$`) are now resolved by `lib/currency-detection.js`, with tests and fixtures. Negative prices, multiple adjacent prices, and split DOM text still need defined behavior.

## Verification results

- `node --test tests/*.test.mjs`: **39 passed, 0 failed**. Timeout, offline, storage, and invalid-context error messages in the output are deliberate failure-path tests.
- `node --check` passed for every runtime JavaScript file; `git diff --check` passed.
- Loaded the actual unpacked extension in Ego and confirmed a live API-backed service-worker conversion.
- Checked all nine existing price fixtures, currency search/selection, swapping, focus/Enter/Escape behavior, global disable/enable, decimal formatting, and preferences after reload.
- Verified content-script site disabling by changing `disabledSites` through extension storage; this does **not** validate the docked panel's site-toggle behavior across tab switches.
- Deliberately resolved quick-converter replies out of order in the real extension page; the latest value stayed visible and clearing the input kept `--`. Normal messaging and default preferences were restored afterward.
- Opened the docked side panel through the welcome button; detailed UI automation used its extension page in a normal tab. Ego's extension manager reported **no runtime or manifest errors**.
- Closed the test task space and stopped the local fixture server. The subsequent release task packaged version 1.0.9 and submitted it for Chrome Web Store review; see `releases/1.0.9.json` for the package hash and observed submission status.

## Review scope and limits

Reviewed the runtime JavaScript, manifest, existing tests, and relevant documentation using the repository graph followed by direct source inspection. The initial graph generation was `2026-09-07T12:01:38Z`, with no recorded parse gaps in the inspected source. Graph call edges for browser event callbacks are incomplete, so listener registrations and message flows were checked directly.

This is not a full accessibility, security, performance, or cross-browser audit. Generated archives and image assets were not audited. Browser fixtures verify deterministic formats, not arbitrary merchant DOMs. The remaining site-policy and metadata questions require explicit behavior decisions rather than mechanical refactoring.
