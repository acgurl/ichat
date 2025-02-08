import { ApiError } from '../services/api'

export class ErrorHandler {
  static handle(error: unknown): string {
    if (ApiError.isApiError(error)) {
      switch (error.status) {
        case 401:
          return '认证失败，请检查 API Key'
        case 403:
          return '没有权限访问该资源'
        case 404:
          return '请求的资源不存在'
        case 429:
          return '请求次数过多，请稍后再试'
        case 500:
          return '服务器内部错误'
        default:
          return error.message || '未知错误'
      }
    }
    return error instanceof Error ? error.message : '未知错误'
  }

  static setupGlobalHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未处理的 Promise 拒绝:', event.reason)
    })
  }
}

export const errorHandler = ErrorHandler.handle
