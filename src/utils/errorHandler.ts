import { ApiError } from '../services/api';

interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: ((error: Error) => void)[] = [];

  private constructor() {}

  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  addListener(listener: (error: Error) => void) {
    this.errorListeners.push(listener);
  }

  handleError(error: Error, options: ErrorHandlerOptions = {}) {
    console.error('Error occurred:', error);

    if (error instanceof ApiError) {
      // 处理 API 错误
      if (error.status === 401) {
        // 处理认证错误
        window.location.href = '/settings';
        return;
      }
    }

    if (!options.silent) {
      this.errorListeners.forEach(listener => listener(error));
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
