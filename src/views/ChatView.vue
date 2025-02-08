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

/* 修改聊天容器的样式 */
.chat-container {
  display: flex;
  height: 100%;
  overflow: hidden;
  background-color: var(--background-primary);
  /* 添加多列布局 */
  flex-direction: row;
}

/* 修改会话列表的样式 */
.session-list {
  width: 300px;
  border-right: 1px solid var(--border-color);
  padding: 1rem;
}

.session-header {
  padding: 1.5rem; /* 增大内边距 */
  border-bottom: 1px solid var(--border-color);
}

.session-name {
  width: 100%;
  padding: 0.75rem; /* 增大内边距 */
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 1.2rem; /* 增大字体 */
  color: var(--text-primary);
}

.session-name:hover {
  border-color: var(--border-color);
}

/* 修改消息列表的样式 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem; /* 增大内边距 */
}

/* 修改消息的样式 */
.message {
  margin-bottom: 1.5rem; /* 增大间距 */
  padding: 1rem; /* 增大内边距 */
  border-radius: 8px;
  max-width: 80%;
  font-size: 1.1rem; /* 增大字体 */
  color: var(--text-primary);
  line-height: 1.6;
}

/* 修改用户消息的样式 */
.message.user {
  background-color: var(--primary-color-light);
  margin-left: auto;
  color: var(--text-primary);
}

/* 修改助手消息的样式 */
.message.assistant {
  background-color: var(--background-secondary);
  margin-right: auto;
  color: var(--text-primary);
}

/* 修改输入容器的样式 */
.input-container {
  padding: 1.5rem; /* 增大内边距 */
  border-top: 1px solid var(--border-color);
  background: var(--background-primary);
}

/* 修改消息输入区域的样式 */
.message-input {
  display: flex;
  gap: 1rem; /* 增大间距 */
  margin-top: 1rem;
}

/* 修改文本框的样式 */
textarea {
  flex: 1;
  padding: 0.75rem; /* 增大内边距 */
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: vertical;
  min-height: 100px; /* 增大高度 */
  font-size: 1.1rem; /* 增大字体 */
  color: var(--text-primary);
}

/* 修改选择框的样式 */
select {
  width: 200px; /* 增大宽度 */
  padding: 0.75rem; /* 增大内边距 */
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1.1rem; /* 增大字体 */
  color: var(--text-primary);
  background-color: var(--background-primary);
}

/* 修改按钮的样式 */
button {
  padding: 0.75rem 1.5rem; /* 增大按钮大小 */
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem; /* 增大字体 */
}

/* 修改禁用按钮的样式 */
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 修改聊天主区域的样式 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
