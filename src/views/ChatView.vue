<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

function updateSession(session: ChatSession) {
  sessionManager.saveSession(session);
  currentSession.value = session;
}
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
