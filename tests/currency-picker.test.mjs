import test from 'node:test';
import assert from 'node:assert/strict';

const documentListeners = new Map();
const fakeDocument = {
  activeElement: null,
  createElement: tagName => new FakeElement(tagName),
  addEventListener(type, listener) {
    if (!documentListeners.has(type)) documentListeners.set(type, []);
    documentListeners.get(type).push(listener);
  }
};
globalThis.document = fakeDocument;

class FakeElement {
  constructor(tagName, className = '') {
    this.tagName = tagName.toUpperCase();
    this.classes = new Set(className.split(' ').filter(Boolean));
    this.children = [];
    this.parent = null;
    this.attributes = new Map();
    this.listeners = new Map();
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.value = '';
    this.id = '';
    this.tabIndex = 0;
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      contains: name => this.classes.has(name),
      toggle: (name, force) => ((force ?? !this.classes.has(name)) ? this.classes.add(name) : this.classes.delete(name))
    };
  }

  set className(value) { this.classes = new Set(value.split(' ').filter(Boolean)); }
  get className() { return [...this.classes].join(' '); }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  replaceChildren(...children) { this.children = []; children.forEach(child => this.appendChild(child)); }
  matches(selector) { return selector.startsWith('.') && this.classes.has(selector.slice(1)); }
  querySelector(selector) {
    for (const child of this.children) {
      if (child.matches(selector)) return child;
      const match = child.querySelector(selector);
      if (match) return match;
    }
    return null;
  }
  closest(selector) {
    for (let node = this; node; node = node.parent) if (node.matches(selector)) return node;
    return null;
  }
  contains(node) {
    for (; node; node = node.parent) if (node === this) return true;
    return false;
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatch(type, extra = {}) {
    const event = { type, target: this, preventDefault() {}, ...extra };
    for (let node = this; node; node = node.parent) (node.listeners.get(type) || []).forEach(fn => fn(event));
    (documentListeners.get(type) || []).forEach(fn => fn(event));
  }
  focus() { fakeDocument.activeElement = this; }
  scrollIntoView() {}
}

const { createCurrencyPicker } = await import('../sidepanel/currency-picker.js');

const list = [
  ['USD', 'US Dollar'], ['EUR', 'Euro'], ['DKK', 'Danish Krone'], ['NOK', 'Norwegian Krone']
].map(([code, name]) => ({ code, label: `${code} - ${name}`, shortLabel: code, search: `${code} ${name}`.toLowerCase() }));
const entries = { list, byCode: new Map(list.map(entry => [entry.code, entry])) };

function buildPicker(options = {}) {
  const section = new FakeElement('section', 'section');
  const root = section.appendChild(new FakeElement('div', 'custom-select-wrapper'));
  const button = root.appendChild(new FakeElement('button', 'custom-select-btn'));
  const display = button.appendChild(new FakeElement('span', 'currency-picker-display'));
  const dropdown = root.appendChild(new FakeElement('div', 'custom-dropdown hidden'));
  const search = dropdown.appendChild(new FakeElement('div', 'dropdown-search-wrap')).appendChild(new FakeElement('input', 'dropdown-search-input'));
  const listElement = dropdown.appendChild(new FakeElement('div', 'dropdown-list'));
  const empty = dropdown.appendChild(new FakeElement('div', 'dropdown-empty'));
  const selected = [];
  const picker = createCurrencyPicker(root, { idPrefix: options.idPrefix || 'test', compact: options.compact, onSelect: code => selected.push(code) });
  const visible = () => listElement.children.filter(item => !item.hidden).map(item => item.dataset.value);
  return { section, root, button, display, dropdown, search, list: listElement, empty, picker, selected, visible };
}

test('shows the selected label and renders the list only when opened', () => {
  const full = buildPicker();
  full.picker.setEntries(entries, 'EUR');
  assert.equal(full.display.textContent, 'EUR - Euro');
  assert.equal(full.list.children.length, 0);

  const compact = buildPicker({ compact: true });
  compact.picker.setEntries(entries, 'USD');
  assert.equal(compact.display.textContent, 'USD');

  full.button.dispatch('click');
  assert.equal(full.picker.isOpen(), true);
  assert.equal(full.list.children.length, 4);
  assert.equal(fakeDocument.activeElement, full.search);
  assert.equal(full.button.getAttribute('aria-expanded'), 'true');
  assert.ok(full.section.classList.contains('dropdown-open'));
  assert.equal(full.list.children.find(item => item.dataset.value === 'EUR').getAttribute('aria-selected'), 'true');
  full.picker.close();
});

test('search filters by code or name and Enter picks the first match', () => {
  const ui = buildPicker();
  ui.picker.setEntries(entries, 'USD');
  ui.button.dispatch('click');
  ui.search.value = 'krone';
  ui.search.dispatch('input');
  assert.deepEqual(ui.visible(), ['DKK', 'NOK']);
  assert.equal(ui.search.getAttribute('aria-activedescendant'), 'test-option-dkk');

  ui.search.value = 'zzz';
  ui.search.dispatch('input');
  assert.deepEqual(ui.visible(), []);
  assert.ok(ui.empty.classList.contains('visible'));

  ui.search.value = 'nor';
  ui.search.dispatch('input');
  ui.search.dispatch('keydown', { key: 'Enter' });
  assert.deepEqual(ui.selected, ['NOK']);
  assert.equal(ui.picker.getValue(), 'NOK');
  assert.equal(ui.display.textContent, 'NOK - Norwegian Krone');
  assert.equal(ui.picker.isOpen(), false);
  assert.equal(fakeDocument.activeElement, ui.button);

  ui.button.dispatch('click');
  assert.deepEqual(ui.visible(), ['USD', 'EUR', 'DKK', 'NOK']);
  ui.picker.close();
});

test('clicking an option selects it, and keyboard navigation moves through visible options', () => {
  const ui = buildPicker();
  ui.picker.setEntries(entries, 'EUR');
  ui.button.dispatch('keydown', { key: 'ArrowDown' });
  assert.equal(fakeDocument.activeElement.dataset.value, 'EUR');
  ui.list.dispatch('keydown', { key: 'ArrowDown' });
  assert.equal(fakeDocument.activeElement.dataset.value, 'DKK');
  ui.list.dispatch('keydown', { key: 'Enter' });
  assert.deepEqual(ui.selected, ['DKK']);

  ui.button.dispatch('click');
  ui.list.children[0].dispatch('click');
  assert.deepEqual(ui.selected, ['DKK', 'USD']);
  assert.equal(ui.picker.isOpen(), false);
});

test('only one picker is open at a time and outside clicks close it', () => {
  const first = buildPicker({ idPrefix: 'first' });
  const second = buildPicker({ idPrefix: 'second' });
  first.picker.setEntries(entries, 'USD');
  second.picker.setEntries(entries, 'EUR');

  first.button.dispatch('click');
  second.button.dispatch('click');
  assert.equal(first.picker.isOpen(), false);
  assert.equal(second.picker.isOpen(), true);

  new FakeElement('div').dispatch('click');
  assert.equal(second.picker.isOpen(), false);
  assert.equal(second.section.classList.contains('dropdown-open'), false);
});

test('unavailable pickers are disabled and do not open', () => {
  const ui = buildPicker();
  ui.picker.setEntries(entries, 'USD');
  ui.picker.setUnavailable('Unavailable');
  assert.equal(ui.button.disabled, true);
  assert.equal(ui.display.textContent, 'Unavailable');
  ui.button.dispatch('click');
  assert.equal(ui.picker.isOpen(), false);
  assert.equal(ui.picker.getValue(), null);
});