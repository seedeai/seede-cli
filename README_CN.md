# Seede AI CLI

[English](./README.md) | 中文版

> 开发者与 AI Agent 的终极设计工具  
> 直接在终端生成专业的 UI、社交媒体图形、海报等

Seede CLI 是 [Seede AI](https://seede.ai) 的命令行接口。它被设计为 AI Agent 的标准设计技能，同时也是开发者的强大工具。

## 为什么选择 Seede？

- 🚀 领先的生成能力：使用最新 AI 模型创建高质量、可编辑的设计
- 🤖 Agent 优先架构：通过 CLI 参数让 Agent 轻松控制
- 🎨 品牌一致性：支持品牌颜色与素材注入
- 🛠️ 全面掌控：精确控制分辨率、格式与场景类型

## 功能特性

- 文本生成设计：从自然语言快速生成复杂设计
- 素材管理：上传并管理 Logo、产品图与参考图
- 设计管理：列表、搜索与获取设计 URL
- 灵活认证：交互式登录与 API Token（适合 CI/CD）

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

**人类用户：**

```bash
seede login
```

**Agent / CI：**

```bash
export SEEDE_API_TOKEN="your_api_token"
```

### 2. 创建设计

**交互模式：**

```bash
seede create
```

**命令行（Agent 模式）：**

```bash
seede create --no-interactive \
  --prompt "现代科技活动海报，霓虹点缀" \
  --scene "poster" \
  --format "png"
```

### 3. 上传素材

```bash
seede upload ./logo.png
```

### 4. 管理 API Token

**创建 Token：**

```bash
seede token create --name "My Agent Token" --expiration 30
```

**列出 Token：**

```bash
seede token list
```

## CLI 参考

### 环境变量

- `SEEDE_API_TOKEN`：用于非交互（CI/Agent）的 API Token
- `SEEDE_API_URL`：覆盖默认 API 基地址（默认：`https://api.seede.ai`）

### 认证

- `seede login` — 交互式登录
- `seede register` — 注册账号
- `seede whoami` — 查看登录状态
- `seede logout` — 清除本地 Token

### 模型

- `seede models` — 列出后端 `/api/task/models` 支持的模型（需要登录）

### Token

- `seede token create [options]`
  - `-n, --name <string>` — Token 名称
  - `-e, --expiration <days>` — 过期天数（不填则永不过期）
  - `--no-interactive` — 只用参数，不进行交互
  - 创建后仅展示一次完整 Token，请立即复制保存
- `seede token list` — 列出你的 Token（遮罩显示）

### 创建

- `seede create [options]`
  - `-n, --name <string>` — 设计名称
  - `-p, --prompt <string>` — 设计描述（非交互模式必填）
  - `-s, --scene <string>` — 场景：`socialMedia | poster | scrollytelling`
  - `-f, --format <string>` — 输出格式：`webp | png | jpg`（默认：`webp`）
  - `--size <string>` — 预设尺寸：`1080x1440 | 1080x1920 | 1920x1080 | 1080x3688 | Custom`
  - `-w, --width <number>` — 宽度（当 `size=Custom` 时生效）
  - `-h, --height <string>` — 高度或 `"auto"`（当 `size=Custom` 时生效）
  - `-r, --ref <string...>` — 参考图片，格式：`url|tag1,tag2`（可重复）
  - `-m, --model <string>` — 使用的模型；交互模式下模型列表来自后端
  - `--no-interactive` — 禁用交互
  - 注意：
    - Scrollytelling 推荐尺寸 `1080x3688`；交互模式选择该场景时默认此尺寸
    - `height="auto"` 支持内容驱动的自适应高度

#### 创建示例

```bash
# 交互模式
seede create

# 非交互，滚动叙事场景（推荐 1080x3688）
seede create --no-interactive \
  --prompt "长页面叙事，粗体标题与图文排布" \
  --scene "scrollytelling" \
  --format "png"

# 自定义尺寸 + 自动高度 + 指定模型
seede create --no-interactive \
  --prompt "产品推广页 hero 区域设计" \
  --scene "socialMedia" \
  --format "webp" \
  --size "Custom" \
  --width 1080 \
  --height auto \
  --model gemini-3-flash

# 使用参考图片
seede create --no-interactive \
  --prompt "科技活动海报，霓虹线与网格布局" \
  --scene "poster" \
  --format "png" \
  --ref "https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a|style,layout,color"
```

### 设计

- `seede designs [options]` — 列出项目
  - `-o, --offset <number>` — 分页偏移（默认：0）
  - `-l, --limit <number>` — 分页大小（默认：40）
  - `-s, --starred` — 仅显示加星项目
  - `--order <field:direction>` — 排序规则，如 `updated_at:DESC`
  - `-q, --search <string>` — 搜索词
  - `-t, --tag <string>` — 标签过滤
- `seede open <designId>` — 输出设计 URL

### 素材

- `seede upload <filePath>` — 上传素材（如 `logo.png`、`banner.svg`）
  - 根据后缀推断 Content-Type
  - 大文件上传具备重试与直传/签名上传支持

### 在 Prompt 中使用素材图片

- 在 prompt 中嵌入指令以引用图片素材：
  - 语法：`@SeedeMaterial(JSON String)`
  - 常用字段：
    - `filename` — 原文件名
    - `url` — 图片的公开 URL（需保证资产可公开访问，否则可能返回 404）
    - `width` — 宽度（像素）
    - `height` — 高度（像素）
    - `aspectRatio` — 宽高比（可选，但有助于布局）
    - `tag` — 对图片的简短描述，便于模型合理放置（推荐填写）
- 示例（嵌入到 prompt 文本中）：

```
标题：Andrej Karpathy 的极简笔记法
可选副标题：如何用一个文件管理所有非项目笔记
@SeedeMaterial({"filename":"142091757051382_.pic_hd.jpg","url":"https://assets.seede.ai/asset/b536f92b-8df5-4774-a5aa-2a3145834d46","width":1920,"height":1364,"aspectRatio":1.41,"tag":""})
```

- JSON 包裹示例（用于说明）：

```json
{
  "prompt": "标题：Andrej Karpathy 的极简笔记法 可选副标题：如何用一个文件管理所有非项目笔记 @SeedeMaterial({\"filename\":\"142091757051382_.pic_hd.jpg\",\"url\":\"https://assets.seede.ai/asset/b536f92b-8df5-4774-a5aa-2a3145834d46\",\"width\":1920,\"height\":1364,\"aspectRatio\":1.41,\"tag\":\"\"})"
}
```

- 上传素材：参考上文 `seede upload`，先导入图片再在 prompt 中引用

### 在 Prompt 中使用参考图片

- 用参考图指令引导风格/布局/颜色等：
  - 语法：`@SeedeReferenceImage(url: 'string', tag: 'style,layout,color')`
  - 字符串使用单引号
  - `url`：公开可访问的图片链接（否则可能返回 404）
  - `tag`：一个或多个标签，使用逗号分隔
  - 预设标签：`all`、`layout`、`style`、`color`、`texture`、`copy`、`font`
- 示例（嵌入到 prompt 文本中）：

```
制作一个科技活动的海报
@SeedeReferenceImage(url: 'https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a', tag: 'style,layout,color')
@SeedeReferenceImage(url: 'https://example.com/reference2.png', tag: 'color,texture')
```

- CLI 参数：

```bash
seede create --no-interactive \
  --prompt "科技活动海报，霓虹线与网格布局" \
  --scene "poster" \
  --format "png" \
  --ref "https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a|style,layout,color" \
  --ref "https://example.com/reference2.png|color,texture"
```

## 许可证

MIT
