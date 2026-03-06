# Seede AI CLI

English | [中文版](./README_CN.md)

> The official CLI tool for [Seede AI](https://seede.ai) - Generate professional designs using AI directly from your terminal.

Seede CLI allows you to create designs, manage your portfolio, and upload assets without leaving your command line. It is also designed to work seamlessly as a Skill for AI Agents like OpenClaw.

## Features

- 🎨 **Text to Design**: Generate designs from natural language descriptions.
- 🖼️ **Asset Management**: Upload images to use as references or materials in your designs.
- 📁 **Design Management**: List, search, and view your generated designs.
- 🤖 **Agent Ready**: Optimized for both human interactive use and programmatic access by AI agents.
- 🔐 **Flexible Auth**: Supports interactive login and environment variable authentication.

## Installation

### Install from npm

```bash
npm install -g seede-cli
```

### From Source

```bash
# Clone the repository
git clone https://github.com/seede-ai/seede-skill.git
cd seede-skill

# Install dependencies
npm install

# Link the command globally
npm link
```

Now you can use the `seede` command anywhere.

## Authentication

### Interactive Login

For personal use, simply run:

```bash
seede login
```

Follow the prompts to log in via Email or Phone. The token will be stored securely in your system configuration.

### Environment Variable

For CI/CD or Agent usage, you can set the `SEEDE_API_TOKEN` environment variable. This takes precedence over the stored login session.

1. Get your API Token from [Seede AI Token Management](https://seede.ai/profile/token).
2. Set the variable:

```bash
export SEEDE_API_TOKEN="your_api_token"
```

You can also use a `.env` file in the project root.

## Usage

### Create a Design

Generate a new design using the `create` command.

**Interactive Mode:**

```bash
seede create
```

**Command Line Arguments:**

```bash
seede create --prompt "A futuristic city poster with neon lights" --scene "poster" --format "png"
```

**Options:**

- `-n, --name <string>`: Design name (default: "My design project")
- `-p, --prompt <string>`: **Required** in non-interactive mode. Description of the design.
- `-s, --scene <string>`: Scene type (`socialMedia`, `poster`, `scrollytelling`, or empty)
- `-f, --format <string>`: Output format (`webp`, `png`, `jpg`, default: `webp`)
- `--size <string>`: Canvas size (`1080x1440`, `1080x1920`, `1920x1080`, `Custom`)
- `-w, --width <number>`: Custom width (if size is Custom)
- `-h, --height <string>`: Custom height (number or "auto", if size is Custom)
- `-m, --model <string>`: Model to use (e.g., `deepseek-v3`)
- `--no-interactive`: Disable interactive prompts (useful for scripts)

### Manage Designs

List your recent designs:

```bash
seede designs
```

**Options:**

- `-l, --limit <number>`: Number of designs to list (default: 40)
- `-o, --offset <number>`: Pagination offset
- `-s, --starred`: Filter by starred designs
- `-q, --search <string>`: Search designs by keyword
- `-t, --tag <string>`: Filter by tag

### Open a Design

Get the URL of a specific design:

```bash
seede open <designId>
```

### Upload Assets

Upload an image to use in your designs:

```bash
seede upload ./path/to/image.png
```

After uploading, you will get an asset URL. You can use it in your prompt like this:
`... @SeedeMaterial({"url":"<ASSET_URL>","tag":"reference"}) ...`

### Other Commands

- `seede whoami`: Check current login status.
- `seede logout`: Clear local session.

## Integration with OpenClaw (Agent Skill)

To use Seede as a skill in OpenClaw or other AI agents:

1. **Install the Skill**:
   Copy the repository to your skill directory.

   ```bash
   cp -r seede-skill ~/.clawdbot/skills/seede
   ```

2. **Configure**:
   Ensure the agent has access to `seede` command or invoke the script directly.
   Set `SEEDE_API_TOKEN` in the agent's environment.

3. **Natural Language Instructions**:
   The agent can now interpret requests like:

   > "Help me design a tech-style event poster using Seede AI"

   And translate them into CLI commands:

   ```bash
   seede create --no-interactive --prompt "tech-style event poster" --scene "poster"
   ```

## License

MIT
