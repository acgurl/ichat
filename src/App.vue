<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
:root {
  --primary-color: #2c3e50;
  --secondary-color: #42b983;
  --background-color: #f8f9fa;
  --text-color: #2c3e50;
  --border-color: #e9ecef;
  --message-user-bg: #42b983;
  --message-assistant-bg: #ffffff;
  --error-color: #dc3545;
  --success-color: #28a745;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  color: var(--text-color);
  background-color: var(--background-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }

  .app-container {
    padding: 0 0.5rem;
  }
}

button {
  cursor: pointer;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  background: var(--secondary-color);
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
  padding: 0.5rem;
  font-size: 1rem;
  color: var(--text-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
