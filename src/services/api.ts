import storage from '../utils/storage';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat';
import type { ModelsResponse, ModelType, ModelSubType } from '../types/models';
import type { UserResponse } from '../types/user';
import { retry } from '../utils/retry';
import { throttle } from '../utils/debounce';
import { errorHandler } from '../utils/errorHandler';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

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
      shouldRetry: (error) => {
        return error instanceof ApiError && error.status >= 500;
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
      shouldRetry: (error) => error instanceof ApiError && error.status >= 500
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
