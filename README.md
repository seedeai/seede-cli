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
git clone https://github.com/seede-ai/seede-skill.git
cd seede-skill
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

## Documentation

For detailed command usage, run:

```bash
seede help
```

## License

MIT
