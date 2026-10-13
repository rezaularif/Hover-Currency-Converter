let openPicker = null;

export function createCurrencyPicker(root, { idPrefix, compact = false, onSelect }) {
  const button = root.querySelector('.custom-select-btn');
  const display = root.querySelector('.currency-picker-display');
  const dropdown = root.querySelector('.custom-dropdown');
  const search = root.querySelector('.dropdown-search-input');
  const list = root.querySelector('.dropdown-list');
  const empty = root.querySelector('.dropdown-empty');
  const section = root.closest('.section');

  let entries = null;
  let value = null;
  let items = [];
  let itemsByCode = new Map();

  const picker = {
    setEntries,
    setValue,
    setUnavailable,
    getValue: () => value,
    open,
    close,
    isOpen
  };

  function labelFor(code) {
    const entry = entries?.byCode.get(code);
    if (!entry) return code || '';
    return compact ? entry.shortLabel : entry.label;
  }

  function renderItems() {
    if (items.length > 0 || !entries) return;
    items = entries.list.map(entry => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.id = `${idPrefix}-option-${entry.code.toLowerCase()}`;
      item.dataset.value = entry.code;
      item.dataset.search = entry.search;
      item.setAttribute('role', 'option');
      item.tabIndex = -1;
      item.textContent = entry.label;
      return item;
    });
    itemsByCode = new Map(items.map(item => [item.dataset.value, item]));
    list.replaceChildren(...items);
    markSelected();
  }

  function clearItems() {
    items = [];
    itemsByCode = new Map();
    list.replaceChildren();
  }

  function markSelected() {
    for (const item of items) {
      const selected = item.dataset.value === value;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', String(selected));
    }
  }

  function setActive(item) {
    for (const element of [button, search]) {
      if (item) {
        element.setAttribute('aria-activedescendant', item.id);
      } else {
        element.removeAttribute('aria-activedescendant');
      }
    }
  }

  function visibleItems() {
    return items.filter(item => !item.hidden);
  }

  function filter(query) {
    const normalizedQuery = query.trim().toLowerCase();
    let visibleCount = 0;
    for (const item of items) {
      const matches = !normalizedQuery || item.dataset.search.includes(normalizedQuery);
      item.hidden = !matches;
      if (matches) visibleCount++;
    }
    empty.classList.toggle('visible', items.length > 0 && visibleCount === 0);
  }

  function focusItem(item) {
    if (!item) return;
    for (const option of items) option.tabIndex = option === item ? 0 : -1;
    setActive(item);
    item.focus();
    item.scrollIntoView({ block: 'nearest' });
  }

  function moveFocus(direction) {
    const visible = visibleItems();
    if (visible.length === 0) return;
    const activeId = button.getAttribute('aria-activedescendant');
    const focusedIndex = visible.indexOf(document.activeElement);
    const currentIndex = focusedIndex >= 0 ? focusedIndex : visible.findIndex(item => item.id === activeId);
    const nextIndex = currentIndex >= 0
      ? (currentIndex + direction + visible.length) % visible.length
      : (direction > 0 ? 0 : visible.length - 1);
    focusItem(visible[nextIndex]);
  }

  function setExpanded(expanded) {
    button.setAttribute('aria-expanded', String(expanded));
    search.setAttribute('aria-expanded', String(expanded));
    root.classList.toggle('open', expanded);
    section?.classList.toggle('dropdown-open', expanded);
  }

  function isOpen() {
    return !dropdown.classList.contains('hidden');
  }

  function open() {
    if (button.disabled || !entries || isOpen()) return;
    if (openPicker && openPicker !== picker) openPicker.close();
    renderItems();
    search.value = '';
    filter('');
    dropdown.classList.remove('hidden');
    setExpanded(true);
    const selected = itemsByCode.get(value) || null;
    setActive(selected);
    selected?.scrollIntoView({ block: 'nearest' });
    search.focus();
    openPicker = picker;
  }

  function close() {
    if (!isOpen()) return;
    dropdown.classList.add('hidden');
    setExpanded(false);
    if (openPicker === picker) openPicker = null;
  }

  function choose(item, returnFocus) {
    const code = item.dataset.value;
    setValue(code);
    close();
    if (returnFocus) button.focus();
    onSelect(code);
  }

  function setValue(code) {
    value = code;
    display.textContent = labelFor(code);
    markSelected();
  }

  function setEntries(nextEntries, code) {
    entries = nextEntries;
    clearItems();
    button.disabled = false;
    button.removeAttribute('aria-disabled');
    setValue(code);
  }

  function setUnavailable(label) {
    close();
    entries = null;
    value = null;
    clearItems();
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    display.textContent = label;
  }

  button.addEventListener('click', () => {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  });

  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      open();
      const visible = visibleItems();
      const selected = visible.find(item => item.dataset.value === value);
      focusItem(selected || (event.key === 'ArrowUp' ? visible.at(-1) : visible[0]));
    } else if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close();
    }
  });

  list.addEventListener('click', (event) => {
    const item = event.target.closest?.('.dropdown-item');
    if (item) choose(item, false);
  });

  list.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(event.key === 'ArrowDown' ? 1 : -1);
    } else if ((event.key === 'Enter' || event.key === ' ') && items.includes(document.activeElement)) {
      event.preventDefault();
      choose(document.activeElement, true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
      button.focus();
    }
  });

  search.addEventListener('input', () => {
    filter(search.value);
    setActive(visibleItems()[0] || null);
  });

  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      button.focus();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = items.find(item => item.id === search.getAttribute('aria-activedescendant'));
      const target = active && !active.hidden ? active : visibleItems()[0];
      if (target) choose(target, true);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const visible = visibleItems();
      focusItem(event.key === 'ArrowDown' ? visible[0] : visible.at(-1));
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !root.contains(event.target)) close();
  });

  return Object.freeze(picker);
}