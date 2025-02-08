<template>
  <div class="home">
    <header class="home-header">
      <h1>欢迎来到 iChat</h1>
      <p>一个简洁、高效的 Web 聊天应用</p>
    </header>
    <main class="home-main">
      <section class="feature-section">
        <h2>主要特性</h2>
        <div class="features">
          <div class="feature-item">
            <h3>聊天会话管理</h3>
            <p>轻松创建、删除和切换不同的聊天会话。</p>
          </div>
          <div class="feature-item">
            <h3>消息发送与展示</h3>
            <p>支持发送文本消息，并以清晰的界面展示聊天记录。</p>
          </div>
          <div class="feature-item">
            <h3>模型选择</h3>
            <p>在不同的语言模型之间切换，以获得不同的聊天体验。</p>
          </div>
          <div class="feature-item">
            <h3>用户设置</h3>
            <p>配置 API 密钥和 URL，轻松管理你的聊天设置。</p>
          </div>
        </div>
      </section>
      <section class="get-started-section">
        <h2>开始使用</h2>
        <p>
          <router-link to="/chat" class="start-chat-button">开始对话</router-link>
          <router-link to="/settings" class="settings-button">设置</router-link>
        </p>
      </section>
    </main>
    <footer class="home-footer">
      <p>&copy; 2024 iChat. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-primary);
  color: var(--text-primary);
  padding: 2rem;
}

.home-header {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.home-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.home-header p {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.home-main {
  flex: 1;
  padding: 2rem;
}

.feature-section {
  margin-bottom: 3rem;
}

.feature-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); /* 调整列宽 */
  gap: 2rem;
}

.feature-item {
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-secondary);
}

.feature-item h3 {
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
}

.feature-item p {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.get-started-section {
  text-align: center;
}

.get-started-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.start-chat-button,
.settings-button {
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 1.3rem;
  transition: background-color 0.3s ease;
}

.start-chat-button {
  background-color: var(--primary-color);
  color: white;
}

.settings-button {
  background-color: var(--accent-color);
  color: white;
}

.start-chat-button:hover {
  background-color: var(--primary-color-dark);
}

.settings-button:hover {
  background-color: var(--accent-color-dark);
}

.home-footer {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
