import type { RetryOptions } from '../services/api';

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const delay = options.delay ?? 1000;

  let lastError: Error = new Error('Initial error');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        break;
      }

      if (options.onRetry) {
        const shouldRetry = options.onRetry(lastError);
        if (shouldRetry === false) {
          break;
        }
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
