interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.log(`请求失败，${attempt}/${maxAttempts} 次重试中...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("重试失败");
}
