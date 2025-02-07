import storage from '../utils/storage';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat';
import type { ModelsResponse, ModelType, ModelSubType } from '../types/models';
import type { UserResponse } from '../types/user';
import { retry } from '../utils/retry';
import { throttle } from '../utils/debounce';
import { errorHandler } from '../utils/errorHandler';
import type { RetryOptions } from './types';

// 统一 ApiError 声明
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static shouldRetry(error: unknown): boolean {
    return ApiError.isApiError(error) && typeof error.status === 'number' && error.status >= 500;
  }
}

class ChatApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(url: string, options: RequestInit & {
    retry?: RetryOptions,
    params?: Record<string, string>
  } = {}): Promise<T> {
    const { params, retry, ...fetchOptions } = options;
    const urlWithParams = params
      ? `${url}?${new URLSearchParams(params)}`
      : url;

    const response = await fetch(urlWithParams, fetchOptions);
    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }

    return response.json();
  }

  async getModels(type: string, subType: string) {
    return this.request(`${this.baseUrl}/models`, {
      method: 'GET',
      params: { type, sub_type: subType },
      retry: {
        retries: 3,
        delay: 1000,
        onRetry: (error: Error) => {
          return ApiError.shouldRetry(error);
        }
      }
    });
  }

  async createCompletion(data: any) {
    return this.request(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      body: JSON.stringify(data),
      retry: {
        retries: 3,
        delay: 1000,
        onRetry: (error: Error) => {
          return ApiError.shouldRetry(error);
        }
      }
    });
  }
}

// 修改重试选项类型
export const chatApi = {
  async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return retry(async () => {
      const apiKey = storage.getApiKey();
      const apiUrl = storage.getApiUrl();
      let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const url = `${baseUrl}/v1/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      return response.json();
    }, {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (error: Error) => {
        return ApiError.shouldRetry(error);
      }
    });
  },

  getModels: throttle(async (type?: ModelType, subType?: ModelSubType): Promise<ModelsResponse> => {
    return retry(async () => {
      const apiKey = storage.getApiKey();
      const apiUrl = storage.getApiUrl();
      let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const url = new URL(`${baseUrl}/v1/models`);

      // 添加查询参数
      if (type) url.searchParams.append('type', type);
      if (subType) url.searchParams.append('sub_type', subType);

      console.log('请求模型列表:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json() as ModelsResponse;
      console.log('原始模型列表响应:', data);
      return data;
    }, {
      maxAttempts: 2,
      delay: 500,
      onRetry: (error: Error) => {
        return ApiError.shouldRetry(error);
      }
    });
  }, 5000),

  async getUserInfo(): Promise<UserResponse> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();
    let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const url = `${baseUrl}/v1/user/info`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();
    return data;
  }
};
