import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../content/overlay.js', import.meta.url), 'utf8');

function setup({ width = 120, height = 30 } = {}) {
  const created = [];
  const appended = [];
  function element(tagName) {
    const classes = new Set();
    const el = {
      tagName, style: {}, textContent: '', offsetWidth: width, offsetHeight: height, children: [],
      get className() { return [...classes].join(' '); },
      set className(value) { classes.clear(); value.split(' ').filter(Boolean).forEach(name => classes.add(name)); },
      classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
      setAttribute() {},
      appendChild(child) { el.children.push(child); },
      contains: node => node === el || el.children.includes(node)
    };
    created.push(el);
    return el;
  }
  const doc = { createElement: element, body: { appendChild: child => appended.push(child) } };
  const context = vm.createContext({ innerWidth: 1000, innerHeight: 800 });
  vm.runInContext(source, context);
  return { overlay: context.HCCOverlay.createOverlay(doc), created, appended };
}

const rect = { left: 10, top: 20, width: 50, height: 16 };
const showAt = (overlay, x, y, extra = {}) => overlay.show({
  x, y, rect, originalText: '$10', convertedText: '€9', position: 'below', theme: 'purple-gradient', ...extra
});

test('elements are created lazily on first show and reused', () => {
  const { overlay, created, appended } = setup();
  assert.equal(created.length, 0);
  assert.equal(overlay.isVisible(), false);
  showAt(overlay, 100, 100);
  assert.equal(created.length, 5);
  assert.equal(appended.length, 2);
  overlay.hide();
  showAt(overlay, 200, 200);
  assert.equal(created.length, 5);
  assert.equal(overlay.isVisible(), true);
});

test('tooltip is positioned with translate and clamped to the viewport', () => {
  const { overlay, created } = setup({ width: 300, height: 40 });
  showAt(overlay, 900, 790);
  const tooltip = created[0];
  assert.equal(tooltip.style.translate, '690px 750px');
  assert.equal(tooltip.style.left, undefined);
  overlay.move(50, 50, rect);
  assert.equal(tooltip.style.translate, '50px 65px');
});

test('positions and themes apply as classes and keep the visible state', () => {
  const { overlay, created } = setup();
  showAt(overlay, 400, 400, { position: 'left', theme: 'ocean-gradient' });
  const tooltip = created[0];
  assert.ok(tooltip.classList.contains('hcc-pos-left'));
  assert.ok(tooltip.classList.contains('hcc-theme-ocean-gradient'));
  assert.ok(tooltip.classList.contains('visible'));
  assert.equal(tooltip.style.translate, '265px 385px');
});

test('highlight box follows the element rectangle without page element changes', () => {
  const { overlay, created } = setup();
  showAt(overlay, 100, 100);
  const highlight = created[4];
  assert.equal(highlight.className, 'hcc-highlight-box visible');
  assert.equal(highlight.style.translate, '10px 20px');
  assert.equal(highlight.style.width, '50px');
  overlay.move(100, 100, { left: 10, top: 5, width: 50, height: 16 });
  assert.equal(highlight.style.translate, '10px 5px');
  overlay.hide();
  assert.equal(highlight.classList.contains('visible'), false);
  assert.equal(overlay.contains(highlight), true);
});