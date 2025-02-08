import storage from '../utils/storage';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat';
import type { ModelsResponse, ModelType, ModelSubType } from '../types/models';
import type { UserResponse } from '../types/user';
import { retry } from '../utils/retry';
import { throttle } from '../utils/debounce';
import { errorHandler } from '../utils/errorHandler';

// 导出重试选项接口
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  onRetry?: (error: Error) => boolean | void;
}

// 统一 ApiError 声明
export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static shouldRetry(error: unknown): boolean {
    if (!ApiError.isApiError(error)) return false;
    // 添加更多重试条件
    return (
      typeof error.status === 'number' &&
      (error.status >= 500 || error.status === 429)
    );
  }
}

// 添加统一的请求头处理函数
const getHeaders = (additionalHeaders?: HeadersInit): Record<string, string> => {
  const apiKey = storage.getApiKey();
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'X-Request-ID': crypto.randomUUID()
  };

  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders);
  }

  return headers;
};

// 添加响应日志处理函数
const logResponse = (url: string, method: string, data: any) => {
  console.log(`[API Response] ${method} ${url}:`, data);
};

class ChatApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(url: string, options: RequestInit & {
    retry?: RetryOptions,  // 修改为 RetryOptions
    params?: Record<string, string>
  } = {}): Promise<T> {
    const { params, retry, headers, ...fetchOptions } = options;
    const urlWithParams = params
      ? `${url}?${new URLSearchParams(params)}`
      : url;

    const response = await fetch(urlWithParams, {
      ...fetchOptions,
      headers: getHeaders(headers)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.statusText, response.status, errorData);
    }

    const data = await response.json();
    logResponse(urlWithParams, fetchOptions.method || 'GET', data);
    return data;
  }

  async getModels(type: string, subType: string) {
    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (error: Error) => {
        console.error('Retry due to error:', error);
        return ApiError.shouldRetry(error);
      }
    };

    return this.request(`${this.baseUrl}/models`, {
      method: 'GET',
      params: { type, sub_type: subType },
      retry: retryOptions
    });
  }

  async createCompletion(data: any) {
    const retryOptions: RetryOptions = {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (error: Error) => {
        console.error('Retry due to error:', error);
        return ApiError.shouldRetry(error);
      }
    };

    return this.request(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      body: JSON.stringify(data),
      retry: retryOptions
    });
  }
}

// 修改重试选项类型
export const chatApi = {
  async createCompletion(
    request: ChatCompletionRequest,
    onData: (data: string) => void,
    onError: (error: any) => void
  ): Promise<void> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();
    let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const url = `${baseUrl}/v1/chat/completions`;

    try {
      // 按照文档要求整理请求体
      const requestBody = {
        messages: request.messages,
        model: request.model,
        temperature: request.temperature ?? 0.7,
        stream: true,
        max_tokens: request.max_tokens ?? 512,
        top_p: request.top_p ?? 0.7,
        top_k: request.top_k ?? 50,
        frequency_penalty: request.frequency_penalty ?? 0,
        presence_penalty: request.presence_penalty ?? 0,
        stop: null,
        user: request.user,
        response_format: {
          type: "text"
        },
        tools: []
      };

      console.log('Request Body:', JSON.stringify(requestBody));

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Data:', errorData);
        throw new ApiError(response.statusText, response.status, errorData);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      if (!reader) {
        throw new Error('Failed to get reader from response body');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const json = JSON.parse(data);
              if (json.choices?.[0]?.delta?.content) {
                const content = json.choices[0].delta.content;
                accumulatedResponse += content;
                onData(accumulatedResponse);
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e);
              console.log('Raw SSE message:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('API Request Error:', error);
      onError(error);
    }
  },

  getModels: throttle(async (type?: ModelType, subType?: ModelSubType): Promise<ModelsResponse> => {
    const retryOptions: RetryOptions = {
      maxAttempts: 2,
      delay: 500,
      onRetry: (error: Error) => {
        console.error('Retry due to error:', error);
        return ApiError.shouldRetry(error);
      }
    };

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
        headers: getHeaders()
      });

      const data = await response.json() as ModelsResponse;
      logResponse(url.toString(), 'GET', data);
      console.log('原始模型列表响应:', data);
      return data;
    }, retryOptions);
  }, 5000),

  async getUserInfo(): Promise<UserResponse> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();
    let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const url = `${baseUrl}/v1/user/info`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();
    logResponse(url, 'GET', data);
    return data;
  }
};
