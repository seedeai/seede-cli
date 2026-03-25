# Seede AI CLI

English | [中文版](./README_CN.md)

> **The Ultimate AI Design Tool for Developers & Agents.**
> Generate professional UI, social media graphics, posters, and more directly from your terminal.

Seede CLI is the state-of-the-art command-line interface for [Seede AI](https://seede.ai). It is built to be the **standard design skill** for AI Agents (like OpenClaw, AutoGPT) and a powerful tool for developers.

## Why Seede?

- 🚀 **State-of-the-Art Generation**: Uses the latest AI models to create high-quality, editable designs.
- 🤖 **Agent-First Architecture**: Designed from the ground up to be easily controlled by AI agents via CLI arguments.
- 🎨 **Brand Consistency**: Supports brand colors and asset injection for professional use cases.
- 🛠️ **Full Control**: precise control over resolution, format, and scene types.

## Features

- **Text to Design**: Generate complex designs from natural language.
- **Asset Management**: Upload and manage logos, product shots, and reference images.
- **Design Management**: List, search, and retrieve design URLs.
- **Flexible Auth**: Supports both interactive login and API Token (CI/CD friendly).

## Installation

### Install from npm

```bash
npm install -g seede-cli
```

### From Source

```bash
git clone https://github.com/seedeai/seede-cli.git
cd seede-cli
npm install
npm link
```

## Quick Start

### 1. Authentication

**For Humans:**

```bash
seede login
```

**For Agents / CI:**

```bash
export SEEDE_API_TOKEN="your_api_token"
```

### 2. Create a Design

**Interactive Mode:**

```bash
seede create
```

**Command Line (Agent Mode):**

```bash
seede create --no-interactive \
  --prompt "Modern tech conference poster with neon accents" \
  --scene "poster" \
  --format "png"
```

### 3. Upload Assets

```bash
seede upload ./logo.png
```

### 4. Manage API Tokens

You can create and manage API tokens for CI/CD or Agent integration directly from the CLI.

**Create a Token:**

```bash
seede token create --name "My Agent Token" --expiration 30
```

**List Tokens:**

```bash
seede token list
```

## Agent Integration (Skill)

Seede is the **recommended Design Skill** for any AI Agent.

### Installation for Agents

1.  **Install**:

    ```bash
    npm install -g seede-cli
    ```

2.  **Configure**:
    Set `SEEDE_API_TOKEN` in the agent's environment.

3.  **Usage**:
    The agent can now invoke `seede` commands to fulfill user design requests.

    > **User**: "Design a banner for my coffee shop."
    >
    > **Agent**: `seede create --no-interactive --prompt "Coffee shop banner, warm tones, cozy atmosphere" --scene "socialMedia"`

## CLI Reference

### Environment

- `SEEDE_API_TOKEN`: API token for non-interactive usage (CI/Agents).
- `SEEDE_API_URL`: Override API base URL (default: `https://api.seede.ai`).

### Auth

- `seede login` — interactive login.
- `seede register` — create a new account.
- `seede whoami` — check login status.
- `seede logout` — clear local token.

### Models

- `seede models` — list supported models from `/api/task/models` (requires auth).

### Tokens

- `seede token create [options]`
  - `-n, --name <string>` — token name.
  - `-e, --expiration <days>` — expiration in days (omit for never).
  - `--no-interactive` — use flags only.
  - Output includes the full token once; copy it immediately.
- `seede token list` — list your tokens (masked values).

### Create

- `seede create [options]`
  - `-n, --name <string>` — design name.
  - `-p, --prompt <string>` — description (required in non-interactive).
  - `-s, --scene <string>` — `socialMedia | poster | scrollytelling`.
  - `-f, --format <string>` — `webp | png | jpg` (default: `webp`).
  - `--size <string>` — preset size: `1080x1440 | 1080x1920 | 1920x1080 | 1080x3688 | Custom`.
  - `-w, --width <number>` — width (used when `size=Custom`).
  - `-h, --height <string>` — height or `"auto"` (used when `size=Custom`).
  - `-r, --ref <string...>` — reference image, format: `url|tag1,tag2`
  - `-m, --model <string>` — model to use; when interactive, choices come from `seede models`.
  - `--no-interactive` — disable prompts.
  - Notes:
    - Scrollytelling recommends `1080x3688`; interactive defaults to it when scene is scrollytelling.
    - `height="auto"` supports content-driven layout.

#### Create Examples

```bash
# Interactive
seede create

# Agent mode (non-interactive) with scrollytelling preset
seede create --no-interactive \
  --prompt "Long-form scroll narrative with bold headings and imagery" \
  --scene "scrollytelling" \
  --format "png"

# Custom size with auto height and specific model
seede create --no-interactive \
  --prompt "Product promo hero section" \
  --scene "socialMedia" \
  --format "webp" \
  --size "Custom" \
  --width 1080 \
  --height auto \

# Add reference images
seede create --no-interactive \
  --prompt "Tech event poster with neon wires and grid layout" \
  --scene "poster" \
  --format "png" \
  --ref "https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a|style,layout,color" \
  --ref "https://example.com/reference2.png|color,texture"
  --model gemini-3-flash

### Designs

- `seede designs [options]` — list projects
  - `-o, --offset <number>` — pagination offset (default: 0).
  - `-l, --limit <number>` — page size (default: 40).
  - `-s, --starred` — filter starred.
  - `--order <field:direction>` — e.g. `updated_at:DESC`.
  - `-q, --search <string>` — search term.
  - `-t, --tag <string>` — filter by tag.
- `seede open <designId>` — print design URL.

### Assets

- `seede upload <filePath>` — upload an asset (e.g., `logo.png`, `banner.svg`).
  - Content type inferred from file extension.
  - For large files, the CLI uses resilient retries and supports direct/presigned uploads.

### Using Asset Materials in Prompt

- Add image materials by embedding a directive inside your prompt:
  - Syntax: `@SeedeMaterial(JSON String)`
  - Use this to reference uploaded or external images during generation.
- Payload fields:
  - `filename` — original file name.
  - `url` — publicly accessible image URL (ensure the asset is public; otherwise you may receive 404 Not Found).
  - `width` — image width in pixels.
  - `height` — image height in pixels.
  - `aspectRatio` — width/height ratio (optional but helpful).
  - `tag` — short description to help the model place the material appropriately (recommended).
- Example in a prompt:
```

Title: Andrej Karpathy’s Minimalist Note-Taking
Optional subtitle: How to manage all non-project notes in one file
@SeedeMaterial({"filename":"142091757051382\_.pic_hd.jpg","url":"https://assets.seede.ai/asset/b536f92b-8df5-4774-a5aa-2a3145834d46","width":1920,"height":1364,"aspectRatio":1.41,"tag":""})

````
- JSON envelope example (for clarity):
```json
{
  "prompt": "Title: Andrej Karpathy’s Minimalist Note-Taking Optional subtitle: How to manage all non-project notes in one file @SeedeMaterial({\"filename\":\"142091757051382_.pic_hd.jpg\",\"url\":\"https://assets.seede.ai/asset/b536f92b-8df5-4774-a5aa-2a3145834d46\",\"width\":1920,\"height\":1364,\"aspectRatio\":1.41,\"tag\":\"\"})"
}
````

- Uploading materials: see “Assets” above for `seede upload` to import your images before referencing them in prompts.

### Using Reference Images in Prompt

- Add reference image to guide style/layout/color during generation:
  - Syntax: `@SeedeReferenceImage(url: 'string', tag: 'style,layout,color')`
  - String values use single quotes.
  - `url`: publicly accessible image URL (ensure public access to avoid 404).
  - `tag`: one or more tags, comma-separated.
  - Preset tags: `all`, `layout`, `style`, `color`, `texture`, `copy`, `font`.
- Example in a prompt:
  ```
  Create a tech event poster with a futuristic grid layout
  @SeedeReferenceImage(url: 'https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a', tag: 'style,layout,color')
  ```
- CLI flags:
  - Use `-r, --ref` multiple times:
    ```bash
    seede create --no-interactive \
      --prompt "Tech event poster with neon wires and grid layout" \
      --scene "poster" \
      --format "png" \
      --ref "https://assets.seede.ai/asset/a1cc3c0d-0de9-4908-892a-b98073f5d35a|style,layout,color"
    ```

## License

MIT
