import storage from '../utils/storage';
import type { ChatCompletionRequest, ChatCompletionResponse } from '../types/chat';
import type { ModelsResponse, ModelType, ModelSubType } from '../types/models';
import type { UserResponse } from '../types/user';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const chatApi = {
  async createCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();

    if (!apiKey || !apiUrl) {
      throw new ApiError('API配置未完成，请先在设置中配置API信息');
    }

    try {
      let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const url = `${baseUrl}/v1/chat/completions`; // 添加 v1 前缀

      const requestBody = {
        messages: request.messages,
        model: request.model,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 512,
        stream: false,
        // 可选参数，只在有值时添加
        ...(request.frequency_penalty && { frequency_penalty: request.frequency_penalty }),
        ...(request.n && { n: request.n }),
        ...(request.response_format && { response_format: request.response_format }),
        ...(request.stop && { stop: request.stop }),
        ...(request.top_k && { top_k: request.top_k }),
        ...(request.top_p && { top_p: request.top_p })
      };

      console.log('发送请求到:', url);
      console.log('请求参数:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        cache: 'no-cache'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `请求失败 (${response.status}): ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('API响应:', data);
      return data;
    } catch (error) {
      console.error('请求错误:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : '网络请求失败'
      );
    }
  },

  async getModels(type?: ModelType, subType?: ModelSubType): Promise<ModelsResponse> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();

    if (!apiKey || !apiUrl) {
      throw new ApiError('API配置未完成，请先在设置中配置API信息');
    }

    try {
      let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const url = new URL(`${baseUrl}/v1/models`); // 添加 v1 前缀

      if (type) url.searchParams.append('type', type);
      if (subType) url.searchParams.append('sub_type', subType);

      console.log('请求模型列表URL:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        throw new ApiError(
          `获取模型列表失败 (${response.status}): ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      console.log('模型列表响应:', data);
      return data;
    } catch (error) {
      console.error('获取模型列表错误:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ?
          `获取模型列表失败: ${error.message}` :
          '获取模型列表失败'
      );
    }
  },

  async getUserInfo(): Promise<UserResponse> {
    const apiKey = storage.getApiKey();
    const apiUrl = storage.getApiUrl();

    if (!apiKey || !apiUrl) {
      throw new ApiError('API配置未完成，请先在设置中配置API信息');
    }

    try {
      let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      const url = `${baseUrl}/v1/user/info`; // 修正 API 路径，添加 v1 前缀

      console.log('获取用户信息:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          `获取用户信息失败 (${response.status}): ${errorText}`,
          response.status
        );
      }

      const data = await response.json();
      if (!data.status || data.code !== 20000) {
        throw new ApiError(data.message || '获取用户信息失败');
      }

      console.log('用户信息响应:', data);
      return data;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      throw new ApiError(
        error instanceof Error ?
          `获取用户信息失败: ${error.message}` :
          '获取用户信息失败'
      );
    }
  }
};
