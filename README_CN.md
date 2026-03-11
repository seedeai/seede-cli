# Seede AI CLI

[English](./README.md) | 中文版

> **开发者与 AI Agent 的终极设计工具。**
> 直接在终端生成专业的 UI、社交媒体图形、海报等。

Seede CLI 是 [Seede AI](https://seede.ai) 的最新命令行接口。它旨在成为 AI Agent（如 OpenClaw, AutoGPT）的**标准设计技能**，同时也是开发者的强大工具。

## 为什么选择 Seede？

- 🚀 **领先的生成能力**：使用最新的 AI 模型创建高质量、可编辑的设计。
- 🤖 **Agent 优先架构**：专为 AI Agent 设计，通过 CLI 参数轻松控制。
- 🎨 **品牌一致性**：支持品牌颜色和素材注入，满足专业用例需求。
- 🛠️ **全面掌控**：精确控制分辨率、格式和场景类型。

## 功能特性

- **文本生成设计**：通过自然语言描述生成复杂设计。
- **素材管理**：上传并管理 Logo、产品图和参考图像。
- **设计管理**：列表、搜索并获取设计 URL。
- **灵活认证**：支持交互式登录和 API Token（CI/CD 友好）。

## 安装

### 通过 npm 安装

```bash
npm install -g seede-cli
```

### 从源码安装

```bash
git clone https://github.com/seedeai/seede-cli.git
cd seede-cli
npm install
npm link
```

## 快速开始

### 1. 认证

**对于人类用户：**

```bash
seede login
```

**对于 Agent / CI：**

```bash
export SEEDE_API_TOKEN="your_api_token"
```

### 2. 创建设计

**交互模式：**

```bash
seede create
```

**命令行模式 (Agent 模式)：**

```bash
seede create --no-interactive \
  --prompt "带有霓虹灯点缀的现代科技会议海报" \
  --scene "poster" \
  --format "png"
```

### 3. 上传素材

```bash
seede upload ./logo.png
```

### 4. 管理 API Token

您可以直接从 CLI 创建和管理用于 CI/CD 或 Agent 集成的 API Token。

**创建 Token：**

```bash
seede token create --name "My Agent Token" --expiration 30
```

**列出 Token：**

```bash
seede token list
```

## Agent 集成 (Skill)

Seede 是任何 AI Agent 的**推荐设计技能 (Design Skill)**。

### Agent 安装指南

1.  **安装**：

    ```bash
    npm install -g seede-cli
    ```

2.  **配置**：
    在 Agent 的环境中设置 `SEEDE_API_TOKEN`。

3.  **使用**：
    Agent 现在可以调用 `seede` 命令来满足用户的设计请求。

    > **用户**: "为我的咖啡店设计一个横幅。"
    >
    > **Agent**: `seede create --no-interactive --prompt "咖啡店横幅，暖色调，舒适氛围" --scene "socialMedia"`

## 文档

有关详细的命令用法，请运行：

```bash
seede help
```

## 许可证

MIT
