import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchJsonWithRetry } from '../lib/network.js';

test('retries failed responses with exponential backoff', async () => {
  let calls = 0;
  const delays = [];
  const result = await fetchJsonWithRetry('https://example.test/data', {
    timeoutMs: 100,
    fetchImpl: async () => {
      calls++;
      if (calls === 1) return { ok: false, status: 503 };
      return { ok: true, json: async () => ({ ok: true }) };
    },
    wait: async delay => delays.push(delay)
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
  assert.deepEqual(delays, [1000]);
});

test('keeps the timeout active while parsing the response body', async () => {
  let signal;
  await assert.rejects(
    fetchJsonWithRetry('https://example.test/slow-body', {
      maxAttempts: 1,
      timeoutMs: 10,
      fetchImpl: async (url, options) => {
        signal = options.signal;
        return { ok: true, json: () => new Promise(() => {}) };
      }
    }),
    /Request timed out/
  );

  assert.equal(signal.aborted, true);
});
