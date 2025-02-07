<template>
  <div class="chat-container">
    <SessionList
      :currentSessionId="currentSessionId"
      @select="switchSession"
    />
    <div class="chat-main">
      <div class="session-header">
        <input v-model="session.name"
               @change="$emit('update:session', session)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import SessionList from './SessionList.vue';  // 添加组件导入
import { chatApi } from '../services/api';
import type { ChatMessage } from '../types/chat';
import type { Model } from '../types/models';
import type { ChatSession } from '../utils/session';
import { sessionManager } from '../utils/session';
import { debounce } from '../utils/debounce';
import { errorHandler } from '../utils/errorHandler';

const props = defineProps<{
  session: ChatSession;
}>();

const emit = defineEmits<{
  (e: 'update:session', session: ChatSession): void;
}>();

const messages = ref<ChatMessage[]>([]);
const userInput = ref('');
const selectedModel = ref(props.session.model);
const messagesRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const error = ref('');
const models = ref<Model[]>([]);
const isLoadingModels = ref(false);

// 移除 currentSession，改用 props.session
const currentSessionId = ref(props.session.id);

// 监听 props.session 的变化
watch(() => props.session, (newSession) => {
  messages.value = newSession.messages;
  selectedModel.value = newSession.model;
}, { immediate: true });

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

    // 更新会话
    const updatedSession = {
      ...props.session,
      messages: messages.value,
      lastUpdated: Date.now()
    };
    emit('update:session', updatedSession);
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

const switchSession = (sessionId: string) => {
  if (!sessionId) return;
  const session = sessionManager.getSession(sessionId);
  if (session) {
    currentSessionId.value = sessionId;
    emit('update:session', session);
  }
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

const loadModelList = async () => {
  try {
    const response = await getModelList()
    console.log('获取到的模型列表响应:', response)
    const modelList = response.data.map(model => ({
      value: model.id,
      label: model.name
    }))
    console.log('处理后的模型列表:', modelList)
    return modelList
  } catch (error) {
    console.log(' 加载模型列表失败:', error)
    return []
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;
}

.session-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.session-name {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 1.1rem;
}

.session-name:hover {
  border-color: var(--border-color);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background-color: var(--primary-color-light);
  margin-left: auto;
}

.message.assistant {
  background-color: #f5f5f5;
  margin-right: auto;
}

.input-container {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: white;
}

.message-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
}

select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 主聊天区域容器 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
