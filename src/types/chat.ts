export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResponseFormat {
  type: string;
}

export interface FunctionTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model: string;
  frequency_penalty?: number;
  max_tokens?: number;
  n?: number;
  response_format?: ResponseFormat;
  stop?: string[];
  stream?: boolean;
  temperature?: number;
  tools?: FunctionTool[];
  top_k?: number;
  top_p?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  created: number;
  id: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
