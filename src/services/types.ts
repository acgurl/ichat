export interface RetryOptions {
  retries?: number;
  delay?: number;
  onRetry?: (error: Error, attempt: number) => boolean | void;
  maxAttempts?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}
