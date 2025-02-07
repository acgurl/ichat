export interface RetryOptions {
  retries?: number;
  delay?: number;
  maxAttempts?: number;
  onRetry?: (error: Error, attempt: number) => boolean | void;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}
