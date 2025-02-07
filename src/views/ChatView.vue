<script setup lang="ts">
import ChatWindow from '../components/ChatWindow.vue'
</script>

<template>
  <div class="chat-view">
    <header>
      <router-link to="/" class="back-btn">返回</router-link>
      <h2>对话</h2>
    </header>
    <ChatWindow />
  </div>
</template>

<style scoped>
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
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
