<template>
  <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
    <button @click="toggleDarkMode" class="dark-mode-toggle">
      {{ isDarkMode ? '切换到浅色模式' : '切换到深色模式' }}
    </button>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const isDarkMode = ref(false);
const highlightStyle = ref(localStorage.getItem('highlightStyle') || 'github-dark');

onMounted(() => {
  // 检查本地存储是否有暗黑模式设置
  const storedDarkMode = localStorage.getItem('darkMode');
  if (storedDarkMode === 'true') {
    isDarkMode.value = true;
  }
  loadHighlightStyle();
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', String(isDarkMode.value));
};

const loadHighlightStyle = () => {
  const style = localStorage.getItem('highlightStyle') || 'github-dark';
  // 动态加载 CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${style}.min.css`;
  document.head.appendChild(link);
};

watch(highlightStyle, (newStyle) => {
  localStorage.setItem('highlightStyle', newStyle);
  // 重新加载样式
  loadHighlightStyle();
});
</script>

<style>
/* 浅色模式 CSS 变量 */
:root {
  --primary-color: #1e88e5; /* DeepSeek 蓝 */
  --primary-color-light: #bbdefb;
  --primary-color-dark: #1565c0;
  --accent-color: #4caf50;
  --accent-color-dark: #388e3c;
  --background-primary: #fff;
  --background-secondary: #f5f5f5;
  --text-primary: #212121;
  --text-secondary: #757575;
  --border-color: #e0e0e0;
  --error-color: #f44336;
  --success-color: #4caf50;
  --message-user-bg: #e3f2fd;
  --message-ai-bg: #fff;
}

/* 深色模式 CSS 变量 */
.dark-mode {
  --primary-color: #64b5f6;
  --primary-color-light: #424242;
  --primary-color-dark: #1976d2;
  --accent-color: #81c784;
  --accent-color-dark: #33691e;
  --background-primary: #303030;
  --background-secondary: #424242;
  --text-primary: #fff;
  --text-secondary: #bdbdbd;
  --border-color: #616161;
  --error-color: #e57373;
  --success-color: #81c784;
  --message-user-bg: #424242;
  --message-ai-bg: #303030;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Roboto', sans-serif; /* 更改字体 */
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--background-primary);
  -webkit-font-smoothing: antialiased; /* 字体平滑 */
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%; /* 确保 #app 填充整个 body */
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100%; /* 确保 app-container 至少填充整个视口 */
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .app-container {
    padding: 0 1rem;
  }
}

button {
  cursor: pointer;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1.1rem;
  background: var(--accent-color);
  color: white;
  transition: opacity 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input, textarea, select {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 添加全局样式，解决字体过长折叠的问题 */
* {
  word-break: break-word;
}

/* 添加暗黑模式切换按钮样式 */
.dark-mode-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}
</style>
