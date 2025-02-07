export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let inThrottle = false;
  let lastPromise: Promise<ReturnType<T>> | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    if (!inThrottle) {
      inThrottle = true;
      lastPromise = Promise.resolve(fn.apply(this, args));
      setTimeout(() => inThrottle = false, limit);
      return lastPromise;
    }
    return lastPromise as Promise<ReturnType<T>>;
  };
}
