import test from 'node:test';
import assert from 'node:assert/strict';

async function setup({ rates = { USD: 1, EUR: 0.9, JPY: 150 }, lastFetch = Date.now(), storageError = false, fetchImpl } = {}) {
  let listener;
  let fetchCalls = 0;
  globalThis.chrome = {
    storage: {
      local: {
        get: async defaults => {
          if (storageError) throw new Error('Storage unavailable');
          return { ...defaults, rates, lastFetch };
        },
        set: async () => {}
      }
    },
    runtime: {
      onMessage: { addListener: fn => { listener = fn; } },
      onInstalled: { addListener() {} }, onStartup: { addListener() {} }
    },
    action: { onClicked: { addListener() {} } }
  };
  globalThis.fetch = async (...args) => { fetchCalls++; return fetchImpl(...args); };
  await import(`../background/service-worker.js?test=${Math.random()}`);
  return {
    listener,
    calls: () => fetchCalls,
    send: message => new Promise(resolve => listener(message, {}, resolve))
  };
}

const conversion = { type: 'convert', amount: 10, fromCurrency: 'USD', toCurrency: 'EUR' };

test('worker conversion boundary, caching, and error responses', async t => {
  const originalChrome = globalThis.chrome;
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.chrome = originalChrome; globalThis.fetch = originalFetch; });

  await t.test('uses cached rates and currency precision', async () => {
    const app = await setup();
    assert.deepEqual(await app.send(conversion), { success: true, converted: 9, decimals: 2 });
    assert.deepEqual(await app.send({ ...conversion, toCurrency: 'JPY' }), { success: true, converted: 1500, decimals: 0 });
    assert.equal(app.calls(), 0);
    assert.equal(app.listener(null, {}, () => {}), undefined);
    assert.equal(app.listener({ type: 'unknown' }, {}, () => {}), undefined);
  });

  await t.test('rejects malformed amounts and currencies', async () => {
    const app = await setup();
    for (const amount of [NaN, Infinity, -1, 0, '10', null, Number.MAX_VALUE]) {
      const response = await app.send({ ...conversion, amount, toCurrency: 'JPY' });
      assert.equal(response.success, false, `amount ${amount}`);
    }
    for (const toCurrency of ['XYZ', 'constructor', '__proto__', null]) {
      assert.equal((await app.send({ ...conversion, toCurrency })).success, false);
    }
  });

  await t.test('rejects corrupt cached rates', async () => {
    for (const rate of [0, -1, Infinity, NaN, '0.9', null]) {
      const app = await setup({ rates: { USD: 1, EUR: rate } });
      assert.equal((await app.send(conversion)).success, false);
    }
  });

  await t.test('concurrent cold conversions share a fetch', async () => {
    let resolveFetch;
    const app = await setup({ rates: null, lastFetch: 0,
      fetchImpl: () => new Promise(resolve => { resolveFetch = resolve; }) });
    const first = app.send(conversion);
    const second = app.send(conversion);
    await new Promise(resolve => setImmediate(resolve));
    resolveFetch({ ok: true, json: async () => ({ usd: { usd: 1, eur: 0.9, bad: -2 } }) });
    assert.equal((await first).converted, 9);
    assert.equal((await second).converted, 9);
    assert.equal(app.calls(), 1);
  });

  await t.test('failed refresh uses the fallback API before stale rates', async () => {
    const urls = [];
    const app = await setup({ lastFetch: 0, fetchImpl: async url => {
      urls.push(url);
      if (url.includes('jsdelivr')) return { ok: false, status: 503 };
      return { ok: true, json: async () => ({ usd: { usd: 1, eur: 0.95 } }) };
    } });
    assert.equal((await app.send(conversion)).converted, 9.5);
    assert.equal(urls.length, 4);
    assert.match(urls[3], /currency-api.pages.dev/);
  });

  await t.test('offline refresh preserves usable stale rates', async () => {
    const app = await setup({ lastFetch: 0, fetchImpl: async () => { throw new Error('Offline'); } });
    assert.equal((await app.send(conversion)).converted, 9);
    assert.equal(app.calls(), 6);
  });

  await t.test('storage failures still return a failure response', async () => {
    const app = await setup({ storageError: true });
    assert.deepEqual(await app.send(conversion), { success: false, error: 'No rates available' });
  });
});
