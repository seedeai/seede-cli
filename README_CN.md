# Seede AI CLI

[English](./README.md) | 中文版

> [Seede AI](https://seede.ai) 的官方 CLI 工具 - 直接在终端中使用 AI 生成专业设计。

Seede CLI 允许您在不离开命令行的情况下创建设计、管理作品集和上传素材。它还专为 OpenClaw 等 AI Agent 设计，可作为 Skill 无缝集成。

## 功能特性

- 🎨 **文本生成设计**：通过自然语言描述生成设计。
- 🖼️ **素材管理**：上传图像以用作设计的参考或素材。
- 📁 **设计管理**：列表、搜索和查看您生成的设计。
- 🤖 **Agent 就绪**：针对人类交互使用和 AI Agent 编程访问进行了优化。
- 🔐 **灵活认证**：支持交互式登录和环境变量认证。

## 安装

### 通过 npm 安装

```bash
npm install -g seede-cli
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/seede-ai/seede-skill.git
cd seede-skill

# 安装依赖
npm install

# 全局链接命令
npm link
```

现在您可以在任何地方使用 `seede` 命令。

## 认证

### 交互式登录

个人使用时，只需运行：

```bash
seede login
```

按照提示通过电子邮件或电话登录。Token 将安全地存储在您的系统配置中。

### 环境变量

对于 CI/CD 或 Agent 使用，您可以设置 `SEEDE_API_TOKEN` 环境变量。这将优先于存储的登录会话。

1. 从 [Seede AI 令牌管理](https://seede.ai/profile/token) 获取您的 API Token。
2. 设置变量：

```bash
export SEEDE_API_TOKEN="your_api_token"
```

您也可以在项目根目录使用 `.env` 文件。

## 使用方法

### 创建设计

使用 `create` 命令生成新设计。

**交互模式：**

```bash
seede create
```

**命令行参数：**

```bash
seede create --prompt "一张带有霓虹灯的未来城市海报" --scene "poster" --format "png"
```

**选项：**

- `-n, --name <string>`: 设计名称 (默认: "My design project")
- `-p, --prompt <string>`: **必填** (在非交互模式下)。设计的描述。
- `-s, --scene <string>`: 场景类型 (`socialMedia`, `poster`, `scrollytelling` 或留空)
- `-f, --format <string>`: 输出格式 (`webp`, `png`, `jpg`, 默认: `webp`)
- `--size <string>`: 画布尺寸 (`1080x1440`, `1080x1920`, `1920x1080`, `Custom`)
- `-w, --width <number>`: 自定义宽度 (如果尺寸为 Custom)
- `-h, --height <string>`: 自定义高度 (数字或 "auto", 如果尺寸为 Custom)
- `-m, --model <string>`: 使用的模型 (例如 `deepseek-v3`)
- `--no-interactive`: 禁用交互式提示 (适用于脚本)

### 管理设计

列出您最近的设计：

```bash
seede designs
```

**选项：**

- `-l, --limit <number>`: 列出的设计数量 (默认: 40)
- `-o, --offset <number>`: 分页偏移量
- `-s, --starred`: 仅筛选加星标的设计
- `-q, --search <string>`: 按关键字搜索设计
- `-t, --tag <string>`: 按标签筛选

### 打开设计

获取特定设计的 URL：

```bash
seede open <designId>
```

### 上传素材

上传图像以在设计中使用：

```bash
seede upload ./path/to/image.png
```

上传后，您将获得一个素材 URL。您可以像这样在提示词中使用它：
`... @SeedeMaterial({"url":"<ASSET_URL>","tag":"reference"}) ...`

### 其他命令

- `seede whoami`: 检查当前登录状态。
- `seede logout`: 清除本地会话。

## 集成到 OpenClaw (Agent Skill)

要在 OpenClaw 或其他 AI Agent 中作为 Skill 使用 Seede：

1. **安装 Skill**：
   将仓库复制到您的 skill 目录。

   ```bash
   cp -r seede-skill ~/.clawdbot/skills/seede
   ```

2. **配置**：
   确保 Agent 可以访问 `seede` 命令或直接调用脚本。
   在 Agent 的环境中设置 `SEEDE_API_TOKEN`。

3. **自然语言指令**：
   Agent 现在可以解释如下请求：

   > "帮我使用 Seede AI 设计一张科技风格的活动海报"

   并将其翻译为 CLI 命令：

   ```bash
   seede create --no-interactive --prompt "科技风格活动海报" --scene "poster"
   ```

## 许可证

MIT
