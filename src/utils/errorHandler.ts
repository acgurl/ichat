import { ApiError } from '../services/api';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: ((error: Error) => void)[] = [];

  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error) {
    console.error('Error occurred:', error);

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          window.location.href = '/settings';
          break;
        case 429:
          return '请求过于频繁，请稍后再试';
        case 500:
          return '服务器错误，请稍后重试';
        default:
          return error.message;
      }
    }

    return '发生未知错误，请刷新页面重试';
  }
}

export const errorHandler = ErrorHandler.getInstance();
