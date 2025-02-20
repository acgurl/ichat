<template>
  <div class="settings">
    <header>
      <router-link to="/" class="back-btn">返回</router-link>
      <h2>设置</h2>
    </header>

    <div class="settings-form">
      <div class="form-group">
        <label>API 地址</label>
        <input type="url" v-model="apiUrl"
               placeholder="请输入API地址" />
      </div>
      <div class="form-group">
        <label>API 密钥</label>
        <input type="password" v-model="apiKey"
               placeholder="请输入API密钥" />
      </div>
      <div class="form-group">
        <label>代码高亮样式</label>
        <select v-model="selectedHighlightStyle">
          <option v-for="style in highlightStyles" :key="style" :value="style">
            {{ style }}
          </option>
        </select>
      </div>
      <div v-if="userInfo" class="user-info">
        <h3>账户信息</h3>
        <div class="info-item">
          <span class="label">用户名：</span>
          <span>{{ userInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">当前余额：</span>
          <span>{{ userInfo.balance }}</span>
        </div>
        <div class="info-item">
          <span class="label">充值余额：</span>
          <span>{{ userInfo.chargeBalance }}</span>
        </div>
        <div class="info-item">
          <span class="label">总余额：</span>
          <span>{{ userInfo.totalBalance }}</span>
        </div>
        <div class="info-item">
          <span class="label">状态：</span>
          <span>{{ userInfo.status }}</span>
        </div>
      </div>
      <div class="form-actions">
        <button @click="saveSettings"
                :disabled="!isValid || isSaving"
                class="save-btn">
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </div>
      <p class="hint">请妥善保管您的API配置信息</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { chatApi } from '../services/api'
import type { UserInfo } from '../types/user'
import storage from '../utils/storage'
import { useRouter } from 'vue-router'

const router = useRouter()
const apiKey = ref(storage.getApiKey() || '')
const apiUrl = ref(storage.getApiUrl() || '')
const error = ref('')
const success = ref('')
const isSaving = ref(false)
const userInfo = ref<UserInfo | null>(null)

const isValid = computed(() => {
  return apiUrl.value.trim() && apiKey.value.trim()
})

// 添加代码高亮样式选择
const highlightStyles = ref([
  'github',
  'github-dark',
  'atom-one-dark',
  'atom-one-light',
  'vs',
  'vs2015',
  'xt256'
]);
const selectedHighlightStyle = ref(storage.getHighlightStyle() || 'github-dark');

onMounted(async () => {
  if (storage.getApiKey() && storage.getApiUrl()) {
    try {
      const response = await chatApi.getUserInfo();
      if (response.status) {
        userInfo.value = response.data;
      }
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
  }
})

async function saveSettings() {
  if (!isValid.value || isSaving.value) return

  error.value = ''
  success.value = ''
  isSaving.value = true

  try {
    // 验证 URL 格式
    new URL(apiUrl.value)

    storage.setApiUrl(apiUrl.value.trim())
    storage.setApiKey(apiKey.value.trim())
    storage.setHighlightStyle(selectedHighlightStyle.value); // 保存高亮样式

    // 保存配置后刷新用户信息
    const response = await chatApi.getUserInfo();
    if (response.status) {
      userInfo.value = response.data;
    }

    success.value = '配置已保存'
    setTimeout(() => {
      router.push('/chat')
    }, 1000)
  } catch (err) {
    error.value = '请输入有效的 API 地址'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.settings {
  padding: 2rem;
  max-width: 1200px; /* 增大最大宽度 */
  margin: 0 auto;
  display: flex; /* 使用 Flexbox 布局 */
  flex-direction: column;
}

header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.1rem;
}

h2 {
  margin: 0;
  color: var(--primary-color);
}

.settings-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex: 1; /* 占据剩余空间 */
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
}

.save-btn {
  width: 100%;
  max-width: 200px;
  padding: 0.8rem;
}

.hint {
  color: var(--text-color);
  opacity: 0.8;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-message {
  color: var(--error-color);
}

.success-message {
  color: var(--success-color);
}

.user-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.user-info h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.info-item {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1rem;
}

.info-item .label {
  color: var(--text-color);
  opacity: 0.7;
  min-width: 70px;
}

@media (min-width: 769px) {
  .settings {
    flex-direction: row; /* 横向排列 */
    align-items: flex-start; /* 顶部对齐 */
    gap: 2rem; /* 调整间距 */
  }

  .settings-form {
    max-width: 600px; /* 限制表单宽度 */
  }

  .user-info {
    flex: 1; /* 占据剩余空间 */
    margin-top: 0; /* 移除上边距 */
  }
}

@media (max-width: 768px) {
  .settings {
    padding: 0.5rem;
  }

  .settings-form {
    padding: 1rem;
  }
}
</style>
