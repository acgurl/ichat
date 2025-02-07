export type ModelType = 'text' | 'image' | 'audio' | 'video';
export type ModelSubType = 'chat' | 'embedding' | 'reranker' | 'text-to-image' | 'image-to-image' | 'speech-to-text' | 'text-to-video';

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

// 修改为实际的 API 响应格式
export interface ModelsResponse {
  object: string;
  data: Model[];
}
