<script setup lang="ts">
import { ref, onMounted } from 'vue'
import storage from '../utils/storage'

const hasApiKey = ref(false)

onMounted(() => {
  hasApiKey.value = !!storage.getApiKey()
})
</script>

<template>
  <div class="home">
    <h1>欢迎使用 iChat</h1>
    <div class="actions">
      <router-link to="/chat" class="btn" v-if="hasApiKey">开始对话</router-link>
      <router-link to="/settings" class="btn">设置</router-link>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  text-decoration: none;
  background: var(--secondary-color);
  color: white;
  border-radius: 8px;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
