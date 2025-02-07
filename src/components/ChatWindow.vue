<template>
  <div class="chat-container">
    <div class="messages" ref="messagesRef">
      <div v-for="(message, index) in messages" :key="index"
           :class="['message', message.role]">
        {{ message.content }}
      </div>
    </div>

    <div class="input-container">
      <select v-model="selectedModel" :disabled="isLoading || isLoadingModels">
        <option v-if="isLoadingModels" value="">加载模型列表中...</option>
        <option v-else-if="models.length === 0" value="">未找到可用模型</option>
        <option v-else-if="error" value="">加载失败，请刷新重试</option>
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
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { chatApi } from '../services/api';
import type { ChatMessage } from '../types/chat';
import type { Model } from '../types/models';

const messages = ref<ChatMessage[]>([]);
const userInput = ref('');
const selectedModel = ref('deepseek-ai/DeepSeek-V3');
const messagesRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const error = ref('');
const models = ref<Model[]>([]);
const isLoadingModels = ref(false);

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
    models.value = response.data;
    if (models.value.length > 0) {
      selectedModel.value = models.value[0].id;
    }
  } catch (err) {
    error.value = '加载模型列表失败';
    console.error('加载模型列表失败:', err);
  } finally {
    isLoadingModels.value = false;
  }
});

async function sendMessage() {
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : '发送消息失败';
    userInput.value = currentInput;
    messages.value.pop(); // 移除失败的消息
  } finally {
    isLoading.value = false;
  }
}

function formatModelName(modelId: string): string {
  return modelId.split('/').pop() || modelId;
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message {
  max-width: 80%;
  padding: 0.8rem;
  margin: 0.5rem;
  border-radius: 8px;
  line-height: 1.5;
}

.user {
  background: var(--message-user-bg);
  color: white;
  align-self: flex-end;
}

.assistant {
  background: var(--message-assistant-bg);
  border: 1px solid var(--border-color);
  align-self: flex-start;
}

.input-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

select {
  width: 100%;
  margin-bottom: 1rem;
}

select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.message-input {
  display: flex;
  gap: 1rem;
}

textarea {
  flex: 1;
  min-height: 80px;
  resize: vertical;
  padding: 0.8rem;
}

.error-message {
  color: var(--error-color);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .chat-container {
    padding: 0.5rem;
  }

  .message {
    max-width: 90%;
    padding: 0.6rem;
  }

  .message-input {
    flex-direction: column;
  }

  button {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>
