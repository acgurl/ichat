# iChat - 硅基流动 AI 对话助手

基于硅基流动 AI 平台开发的对话应用，支持多种大语言模型。

## 功能特点

- 🚀 支持多种大语言模型
- 💫 实时对话响应
- 🔐 安全的 API 密钥管理
- 💰 余额查询功能
- 📱 响应式设计，支持移动端
- 🌈 简洁美观的界面设计

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/ichat.git

# 进入项目目录
cd ichat

# 安装依赖
npm install
```

### 配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置你的 API 信息：
```bash
VITE_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.siliconflow.cn
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 使用说明

1. 首次使用需要在设置页面配置 API 密钥
2. 支持的模型包括：
   - DeepSeek-V3
   - Qwen2.5-7B
   - 更多模型陆续添加中...
3. 可以通过设置页面查看账户余额和状态
4. 支持 Ctrl+Enter 快捷发送消息

## 技术栈

- Vue 3
- TypeScript
- Vue Router
- Vite

## 项目结构

```
ichat/
├── src/
│   ├── components/    # 组件
│   ├── views/         # 页面
│   ├── services/      # API 服务
│   ├── types/         # 类型定义
│   ├── utils/         # 工具函数
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── public/            # 静态资源
└── ...配置文件
```

## 开发指南

### API 调用

所有 API 调用都在 `src/services/api.ts` 中集中管理，包括：
- 对话完成
- 模型列表获取
- 用户信息查询

### 状态管理

使用 Vue 3 的 Composition API 进行状态管理，主要包括：
- API 配置存储
- 对话历史记录
- 用户信息缓存

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交改动：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目地址：[GitHub](https://github.com/acgurl/ichat)
- 问题反馈：[Issues](https://github.com/acgurl/ichat/issues)

## 致谢

- [硅基流动](https://www.siliconflow.cn) - 提供 AI 模型支持
- Vue.js 团队
- 所有贡献者
