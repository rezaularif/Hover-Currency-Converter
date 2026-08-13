export async function fetchJsonWithRetry(url, options = {}) {
  const maxAttempts = options.maxAttempts ?? 3;
  const timeoutMs = options.timeoutMs ?? 10000;
  const fetchImpl = options.fetchImpl ?? fetch;
  const wait = options.wait ?? (delay => new Promise(resolve => setTimeout(resolve, delay)));
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    let timeoutId;
    const timeout = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        if (controller) controller.abort();
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const response = await Promise.race([
        fetchImpl(url, controller ? { signal: controller.signal } : {}),
        timeout
      ]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await Promise.race([response.json(), timeout]);
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await wait(Math.pow(2, attempt) * 1000);
      } else {
        console.error('JSON request failed after retries:', error);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}
