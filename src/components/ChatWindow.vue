<template>
  <div class="chat-container">
    <!-- Add session management UI -->
    <div class="session-header">
      <input v-model="currentSession.name"
             @change="sessionManager.saveSession(currentSession)"
             class="session-name" />
    </div>
    <div class="messages" ref="messagesRef">
      <div v-for="(message, index) in messages" :key="index"
           :class="['message', message.role]">
        {{ message.content }}
      </div>
    </div>

    <div class="input-container">
      <select v-model="selectedModel" :disabled="isLoading || isLoadingModels">
        <option v-if="isLoadingModels" value="">加载模型列表中...</option>
        <option v-for="model in models"
                :key="model.id"
                :value="model.id">
          {{ formatModelName(model.id) }}
        </option>
      </select>
      <div class="message-input">
        <textarea v-model="userInput"
                  @keyup.enter.ctrl="sendMessage"
                  :disabled="isLoading"
                  placeholder="输入消息，Ctrl+Enter发送"></textarea>
        <button @click="sendMessage" :disabled="isLoading">
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { chatApi } from '../services/api';
import type { ChatMessage } from '../types/chat';
import type { Model } from '../types/models';
import { sessionManager } from '../utils/session';
import { debounce } from '../utils/debounce';
import { errorHandler } from '../utils/errorHandler';

const messages = ref<ChatMessage[]>([]);
const userInput = ref('');
const selectedModel = ref('Qwen/Qwen2.5-72B-Instruct');
const messagesRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const error = ref('');
const models = ref<Model[]>([]);
const isLoadingModels = ref(false);

const currentSession = ref(sessionManager.createSession(selectedModel.value));

watch(messages, () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}, { deep: true });

onMounted(async () => {
  try {
    isLoadingModels.value = true;
    const response = await chatApi.getModels('text', 'chat');
    console.log('获取到的模型列表响应:', response);

    // 确保响应数据存在且 data 属性是数组
    if (response && response.data) {
      const filteredModels = response.data.filter(model =>
        !model.id.toLowerCase().includes('deprecated') &&
        !model.id.toLowerCase().includes('test')
      );

      models.value = sortModels(filteredModels);
      console.log('处理后的模型列表:', models.value);

      if (models.value.length > 0) {
        const defaultModel = models.value.find(m =>
          m.id === 'Qwen/Qwen2.5-72B-Instruct' ||
          m.id === 'deepseek-ai/DeepSeek-V3'
        );
        selectedModel.value = defaultModel ? defaultModel.id : models.value[0].id;
        currentSession.value = sessionManager.createSession(selectedModel.value);
      }
    } else {
      console.error('模型列表格式不正确:', response);
      error.value = '模型列表格式不正确';
    }
  } catch (err) {
    error.value = '加载模型列表失败';
    console.error('加载模型列表失败:', err);
  } finally {
    isLoadingModels.value = false;
  }
});

// 使用防抖的发送消息函数
const debouncedSendMessage = debounce(async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  error.value = '';

  const userMessage: ChatMessage = {
    role: 'user',
    content: userInput.value.trim()
  };

  messages.value.push(userMessage);
  const currentInput = userInput.value;
  userInput.value = '';
  isLoading.value = true;

  try {
    const response = await chatApi.createCompletion({
      messages: messages.value,
      model: selectedModel.value,
      temperature: 0.7
    });

    messages.value.push(response.choices[0].message);

    // 保存会话
    currentSession.value.messages = messages.value;
    currentSession.value.lastUpdated = Date.now();
    sessionManager.saveSession(currentSession.value);
  } catch (err) {
    errorHandler.handleError(err instanceof Error ? err : new Error('Unknown error'));
    error.value = err instanceof Error ? err.message : '发送消息失败';
    userInput.value = currentInput;
    messages.value.pop(); // 移除失败的消息
  } finally {
    isLoading.value = false;
  }
}, 300);

// 替换原有的 sendMessage
const sendMessage = () => {
  if (!userInput.value.trim() || isLoading.value) return;
  debouncedSendMessage();
};

function formatModelName(modelId: string): string {
  const parts = modelId.split('/');
  const name = parts.pop() || '';
  const vendor = parts.join('/');
  // 优化显示，去除 Instruct 等后缀
  return `${vendor ? `[${vendor}] ` : ''}${name.replace(/-Instruct|-Chat|-Preview/g, '')}`;
}

// 修改模型排序方法
function sortModels(models: Model[]): Model[] {
  return [...models].sort((a, b) => {
    // Pro 模型排在前面
    if (a.id.startsWith('Pro/') && !b.id.startsWith('Pro/')) return -1;
    if (!a.id.startsWith('Pro/') && b.id.startsWith('Pro/')) return 1;

    // 大语言模型优先
    const modelPriority = ['72B', '34B', '32B', '20B', '14B', '9B', '7B', '6B', '1.5B'];
    const aSize = modelPriority.find(size => a.id.includes(size)) || '';
    const bSize = modelPriority.find(size => b.id.includes(size)) || '';
    const aPriority = modelPriority.indexOf(aSize);
    const bPriority = modelPriority.indexOf(bSize);

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return a.id.localeCompare(b.id);
  });
}
</script>
