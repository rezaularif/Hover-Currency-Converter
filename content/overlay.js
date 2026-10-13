(function(root) {
  const DEFAULT_WIDTH = 200;
  const DEFAULT_HEIGHT = 50;
  const CURSOR_OFFSET = 15;
  const VIEWPORT_MARGIN = 10;

  function createOverlay(doc) {
    let tooltip = null;
    let originalSpan = null;
    let convertedSpan = null;
    let highlight = null;
    let appearance = '';
    let position = 'below';
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;
    let highlightRect = null;

    function createElement(tagName, className, parent) {
      const element = doc.createElement(tagName);
      element.className = className;
      if (parent) parent.appendChild(element);
      return element;
    }

    function ensureElements() {
      if (tooltip) return;
      tooltip = createElement('div', 'hcc-tooltip');
      tooltip.setAttribute('role', 'tooltip');
      tooltip.setAttribute('aria-live', 'polite');
      originalSpan = createElement('span', 'hcc-original', tooltip);
      createElement('span', 'hcc-arrow', tooltip).textContent = '→';
      convertedSpan = createElement('span', 'hcc-converted', tooltip);
      highlight = createElement('div', 'hcc-highlight-box');
      doc.body.appendChild(highlight);
      doc.body.appendChild(tooltip);
    }

    function setAppearance(nextPosition, theme) {
      const nextAppearance = `${nextPosition}|${theme}`;
      if (nextAppearance === appearance) return;
      appearance = nextAppearance;
      position = nextPosition;
      const themeClass = theme === 'purple-gradient' ? '' : ` hcc-theme-${theme}`;
      tooltip.className = `hcc-tooltip hcc-pos-${nextPosition}${themeClass}`;
    }

    function placeTooltip(x, y) {
      let left = x;
      let top = y + CURSOR_OFFSET;
      if (position === 'above') {
        top = y - height - CURSOR_OFFSET;
      } else if (position === 'left') {
        left = x - width - CURSOR_OFFSET;
        top = y - height / 2;
      } else if (position === 'right') {
        left = x + CURSOR_OFFSET;
        top = y - height / 2;
      }
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, root.innerWidth - width - VIEWPORT_MARGIN));
      top = Math.max(VIEWPORT_MARGIN, Math.min(top, root.innerHeight - height - VIEWPORT_MARGIN));
      tooltip.style.translate = `${Math.round(left)}px ${Math.round(top)}px`;
    }

    function toPixelRect(rect) {
      return {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    }

    function placeHighlight(rect) {
      if (isAt(rect)) return;
      highlightRect = toPixelRect(rect);
      highlight.style.translate = `${highlightRect.left}px ${highlightRect.top}px`;
      highlight.style.width = `${highlightRect.width}px`;
      highlight.style.height = `${highlightRect.height}px`;
    }

    function show({ x, y, rect, originalText, convertedText, position: nextPosition, theme }) {
      ensureElements();
      originalSpan.textContent = originalText;
      convertedSpan.textContent = convertedText;
      setAppearance(nextPosition, theme);
      width = tooltip.offsetWidth || DEFAULT_WIDTH;
      height = tooltip.offsetHeight || DEFAULT_HEIGHT;
      placeTooltip(x, y);
      placeHighlight(rect);
      tooltip.classList.add('visible');
      highlight.classList.add('visible');
    }

    function isVisible() {
      return tooltip !== null && tooltip.classList.contains('visible');
    }

    function move(x, y, rect) {
      if (!isVisible()) return;
      placeTooltip(x, y);
      placeHighlight(rect);
    }

    function hide() {
      if (!isVisible()) return;
      tooltip.classList.remove('visible');
      highlight.classList.remove('visible');
    }

    function contains(node) {
      return tooltip !== null && (node === tooltip || node === highlight || tooltip.contains(node));
    }

    function isAt(rect) {
      if (highlightRect === null) return false;
      const pixels = toPixelRect(rect);
      return highlightRect.left === pixels.left && highlightRect.top === pixels.top &&
        highlightRect.width === pixels.width && highlightRect.height === pixels.height;
    }

    return Object.freeze({ show, move, hide, isVisible, contains, isAt });
  }

  root.HCCOverlay = Object.freeze({ createOverlay });
})(globalThis);