<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { sessionManager } from '../utils/session';
import type { ChatSession } from '../utils/session';

const props = defineProps({
  currentSessionId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits<{
  (e: 'select', sessionId: string): void;
}>();

const editingId = ref('');
const editingName = ref('');
const sessions = ref<ChatSession[]>([]);

// 更新会话列表
const updateSessions = () => {
  sessions.value = sessionManager.getSortedSessions();
};

// 组件挂载时添加监听器
onMounted(() => {
  updateSessions(); // 初始加载
  const unsubscribe = sessionManager.addListener(updateSessions);
  // 组件卸载时移除监听器
  onUnmounted(unsubscribe);
});

function createNewSession() {
  const session = sessionManager.createSession('Qwen/Qwen2.5-72B-Instruct');
  updateSessions(); // 强制更新列表
  emit('select', session.id);
}

function selectSession(sessionId: string) {
  emit('select', sessionId);
}

function startEditing(session: ChatSession) {
  editingId.value = session.id;
  editingName.value = session.name;
}

function saveSessionName(sessionId: string) {
  if (editingName.value.trim()) {
    sessionManager.renameSession(sessionId, editingName.value);
  }
  editingId.value = '';
}

// 修改删除会话的处理
const deleteSession = async (sessionId: string) => {
  if (confirm('确定要删除这个会话吗？')) {
    sessionManager.deleteSession(sessionId);
    updateSessions(); // 强制更新列表

    if (sessionId === props.currentSessionId) {
      const remainingSessions = sessions.value;
      if (remainingSessions.length > 0) {
        emit('select', remainingSessions[0].id);
      } else {
        createNewSession();
      }
    }
  }
};

const deleteAllSessions = () => {
  if (confirm('确定要删除所有会话吗？此操作不可恢复！')) {
    sessionManager.clearAllSessions();
    updateSessions(); // 强制更新列表
    createNewSession();
  }
};

function togglePin(sessionId: string) {
  sessionManager.togglePinSession(sessionId);
  updateSessions(); // 强制更新列表
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
</script>

<template>
  <div class="session-list">
    <div class="session-list-header">
      <h2>对话列表</h2>
      <div class="header-buttons">
        <button @click="deleteAllSessions" class="danger-btn" title="删除所有会话">
          清空
        </button>
        <button @click="createNewSession" class="new-session-btn">
          新建
        </button>
      </div>
    </div>
    <div class="sessions">
      <div v-for="session in sessions"
           :key="session.id"
           :class="[
             'session-item',
             {
               'active': currentSessionId === session.id,
               'pinned': session.pinned
             }
           ]"
           @click="selectSession(session.id)">
        <div class="session-item-content">
          <!-- 添加置顶标识 -->
          <div class="session-labels">
            <span v-if="session.pinned" class="pin-label">📌</span>
          </div>
          <input v-if="editingId === session.id"
                 v-model="editingName"
                 @blur="saveSessionName(session.id)"
                 @keyup.enter="saveSessionName(session.id)"
                 ref="editInput"
                 class="session-name-input" />
          <span v-else class="session-name" @dblclick="startEditing(session)">
            {{ session.name }}
          </span>
          <span class="session-date">{{ formatDate(session.lastUpdated) }}</span>
        </div>
        <div class="session-actions">
          <button @click.stop="togglePin(session.id)" :title="session.pinned ? '取消置顶' : '置顶'">
            📌
          </button>
          <button @click.stop="deleteSession(session.id)" title="删除">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-list {
  width: 250px;
  border-right: 1px solid var(--border-color);
  background: white;
  display: flex;
  flex-direction: column;
}

.session-list-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sessions {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.session-item:hover {
  background-color: var(--background-secondary);
}

.session-item.active {
  background-color: var(--primary-color-light);
  border-left: 4px solid var(--primary-color);
  font-weight: 500;
}

.session-item.pinned {
  background-color: var(--background-secondary);
}

.session-item.pinned.active {
  background-color: var(--primary-color-light);
}

.session-item-content {
  flex: 1;
  min-width: 0;
}

.session-labels {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.pin-label {
  font-size: 0.8rem;
  opacity: 0.7;
}

.session-name {
  display: block;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.session-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.session-name-input {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.session-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.session-actions button {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.session-actions button:hover {
  opacity: 1;
}

.new-session-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
}

.danger-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.danger-btn:hover {
  background: #c82333;
}

h2 {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
