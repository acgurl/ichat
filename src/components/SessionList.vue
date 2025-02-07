<script setup lang="ts">
import { ref, computed } from 'vue';
import { sessionManager } from '../utils/session';
import type { ChatSession } from '../utils/session';

defineProps({
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
const sessions = computed(() => sessionManager.getSortedSessions());

function createNewSession() {
  const session = sessionManager.createSession('Qwen/Qwen2.5-72B-Instruct');
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

function deleteSession(sessionId: string) {
  if (confirm('确定要删除这个会话吗？')) {
    sessionManager.deleteSession(sessionId);
    if (sessionId === props.currentSessionId) {
      const sessions = sessionManager.getSortedSessions();
      if (sessions.length > 0) {
        emit('select', sessions[0].id);
      } else {
        createNewSession();
      }
    }
  }
}

function togglePin(sessionId: string) {
  sessionManager.togglePinSession(sessionId);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
</script>

<template>
  <div class="session-list">
    <div class="session-list-header">
      <h2>对话列表</h2>
      <button @click="createNewSession" class="new-session-btn">
        新建会话
      </button>
    </div>
    <div class="sessions">
      <div v-for="session in sessions"
           :key="session.id"
           :class="['session-item', { active: currentSessionId === session.id }]"
           @click="selectSession(session.id)">
        <div class="session-item-content">
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
}

.session-item:hover {
  background: #f5f5f5;
}

.session-item.active {
  background: var(--primary-color-light);
}

.session-item-content {
  flex: 1;
  min-width: 0;
}

.session-name {
  display: block;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-date {
  font-size: 0.8rem;
  color: #666;
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

.new-session-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
