---
name: seede
version: 1.0.0
description: Use Seede AI CLI to generate professional design graphics based on text or images. Supports generating posters, social media graphics, UI designs, etc.
homepage: https://seede.ai
metadata:
  {
    "clawdbot":
      {
        "emoji": "🌱",
        "category": "design",
        "requires":
          { "env": ["SEEDE_API_TOKEN"], "bins": ["node", "npm", "seede"] },
      },
  }
---

# Seede AI Skill (CLI)

Quickly generate professional design solutions through the Seede AI CLI based on text descriptions, reference images, or brand themes.

## When to Use

- "Help me design a tech-style event poster"
- "Generate a social media graphic with a similar style based on this reference image"
- "Generate a set of minimalist UI designs for my brand"
- "Add this logo to the design and generate a 1080x1440 image"

## Prerequisites

1. **Node.js**: Ensure Node.js is installed in the environment.
2. **Installation**:

   Install via npm:

   ```bash
   npm install -g seede-cli
   ```

3. **Authentication**:
   - **Option 1: CLI Registration (No token required)**
     Agents can create a new account directly via CLI:

     ```bash
     seede register
     ```

     Follow the interactive prompts to create an account. The token will be saved automatically.

   - **Option 2: API Token**
     - Visit [Seede AI Token Management](https://seede.ai/profile/token)
     - Set the environment variable:
       ```bash
       export SEEDE_API_TOKEN="your_api_token"
       ```

## Core Operations

### Create Design

Generate a new design using the `create` command.

```bash
# Basic usage
seede create --prompt "A futuristic city poster with neon lights" --scene "poster"

# Specify size and format
seede create --prompt "Social media post" --size "1080x1080" --format "png"

# Non-interactive mode (Recommended for Agents)
seede create --no-interactive --prompt "Tech event banner" --scene "socialMedia" --width 1200 --height 630
```

**Options:**

- `-p, --prompt <string>`: Description of the design.
- `-s, --scene <string>`: Scene type (`socialMedia`, `poster`, `scrollytelling`).
- `--size <string>`: Canvas size (`1080x1440`, `1080x1920`, `1920x1080`, `Custom`).
- `-m, --model <string>`: Model to use (e.g., `deepseek-v3`).
- `--no-interactive`: Disable interactive prompts.

### Manage Designs

List recent designs.

```bash
seede designs --limit 5
```

**Options:**

- `-l, --limit <number>`: Number of designs to list.
- `-q, --search <string>`: Search designs by keyword.

### Upload Assets

Upload an image to use as a reference or material.

```bash
seede upload ./path/to/image.png
```

Returns an asset URL that can be used in the prompt.

### Open Design

Get the URL to view or edit a design.

```bash
seede open <designId>
```

## Advanced Usage

### Referencing Assets

After uploading an asset, use the returned URL in your prompt with `@SeedeMaterial`:

```bash
seede create --prompt "Poster with logo ... @SeedeMaterial({'url':'<ASSET_URL>','tag':'logo'})"
```

### Brand Colors

Specify themes and colors using `@SeedeTheme` in the prompt:

```bash
seede create --prompt "Corporate flyer ... @SeedeTheme({'value':'midnight','colors':['#1E293B','#0F172A']})"
```

## Agent Integration Examples

**User Request:**

> "Help me design a tech-style event poster using Seede AI"

**Agent Command:**

```bash
seede create --no-interactive --prompt "tech-style event poster" --scene "poster"
```

**User Request:**

> "Upload this logo.png and use it to create a business card"

**Agent Command:**

1. Upload the image:
   ```bash
   seede upload logo.png
   ```
2. Create design with the returned URL:
   ```bash
   seede create --no-interactive --prompt "Business card with logo @SeedeMaterial({'url':'<URL_FROM_STEP_1>','tag':'logo'})" --scene "poster"
   ```
