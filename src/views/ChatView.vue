<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import ChatWindow from '../components/ChatWindow.vue';
import { sessionManager } from '../utils/session';
import type { ChatSession } from '../utils/session';

const currentSession = ref<ChatSession | null>(null);

onMounted(() => {
  const sessions = sessionManager.getSortedSessions();
  if (sessions.length > 0) {
    currentSession.value = sessions[0];
  } else {
    // 如果没有会话，创建一个新会话
    const newSession = sessionManager.createSession('Qwen/Qwen2.5-72B-Instruct');
    currentSession.value = newSession;
  }
});

// 修改会话更新方法
const updateSession = (session: ChatSession) => {
  sessionManager.saveSession(session);
  // 强制更新当前会话的引用以触发响应式更新
  currentSession.value = {...session};
};

// 添加监听会话列表变化
watch(() => sessionManager.getSortedSessions(), (sessions) => {
  if (!currentSession.value || !sessionManager.getSession(currentSession.value.id)) {
    // 如果当前会话不存在，选择新的会话
    if (sessions.length > 0) {
      currentSession.value = sessions[0];
    } else {
      currentSession.value = sessionManager.createSession('Qwen/Qwen2.5-72B-Instruct');
    }
  }
}, { deep: true });
</script>

<template>
  <div class="chat-view">
    <ChatWindow
      v-if="currentSession"
      :session="currentSession"
      @update:session="updateSession"
    />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  height: 100vh;
  width: 100%;
}

header {
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  text-decoration: none;
  color: #666;
}
</style>
