---
name: seede
version: 1.0.0
description: Use Seede AI to generate professional design graphics based on text or images. Supports generating posters, social media graphics, UI designs, etc.
homepage: https://seede.ai
metadata:
  {
    "clawdbot":
      {
        "emoji": "🌱",
        "category": "design",
        "requires":
          {
            "env": ["SEEDE_API_TOKEN"],
            "bins": ["bash", "curl", "python3", "base64", "file"],
          },
      },
  }
---

# Seede AI Skill

Quickly generate professional design solutions through the Seede AI API based on text descriptions, reference images, or brand themes.

## When to Use

- "Help me design a tech-style event poster"
- "Generate a social media graphic with a similar style based on this reference image"
- "Generate a set of minimalist UI designs for my brand"
- "Add this logo to the design and generate a 1080x1440 image"

## Prerequisites

1. **Obtain API Token:**
   - Visit [Seede AI Token Management](https://seede.ai/profile/token)
   - Create and copy your API Token

2. **Set Environment Variable:**
   ```bash
   export SEEDE_API_TOKEN="your_api_token"
   ```

## API Base URL

```
https://api.seede.ai
```

## Authentication

Include the API Token in the request headers:

```bash
Authorization: $SEEDE_API_TOKEN
```

## Core Operations

### Use the Bundled CLI Helper (Recommended)

This skill includes a small helper script at `{baseDir}/scripts/seede.sh` that wraps the Seede API and handles polling.

```bash
# List tasks
bash "{baseDir}/scripts/seede.sh" tasks

# List designs
bash "{baseDir}/scripts/seede.sh" designs

# Create a design (defaults to 1080x1440)
bash "{baseDir}/scripts/seede.sh" create "Event Poster" "Minimalist tech-style launch event poster @SeedeTheme({'value':'tech'})"

# Create a design with custom size
bash "{baseDir}/scripts/seede.sh" create "Post" "A futuristic city" 1080 1440

# Get task details
bash "{baseDir}/scripts/seede.sh" get TASK_ID

# Upload an asset (returns asset URL JSON)
bash "{baseDir}/scripts/seede.sh" upload /path/to/logo.png

# List available models
bash "{baseDir}/scripts/seede.sh" models
```

### Create Design Task (Most Common)

Create an asynchronous design task. Supports specifying models, sizes, and reference images.

```bash
curl -X POST "https://api.seede.ai/api/task/create" \
  -H "Authorization: $SEEDE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Social Media Poster",
    "prompt": "Minimalist style tech launch event poster",
    "size": {"w": 1080, "h": 1440},
    "model": "gemini-3-flash"
  }'
```

### Get Task Status and Results

An `id` is returned after task creation. Since design usually takes 30-90 seconds, polling is required.

```bash
# Get details of a specific task
curl -s "https://api.seede.ai/api/task/{taskId}" \
  -H "Authorization: $SEEDE_API_TOKEN" | jq .

# Get all task list
curl -s "https://api.seede.ai/api/task" \
  -H "Authorization: $SEEDE_API_TOKEN" | jq .
```

### Upload Assets

Upload images and other assets to reference them in the `prompt`.

```bash
# Upload an asset (returns asset URL JSON)
bash "{baseDir}/scripts/seede.sh" upload /path/to/logo.png
```

## Advanced Features

### Referencing Assets

Reference uploaded assets in the `prompt` using `@SeedeMaterial`:
`Design description...@SeedeMaterial({"filename":"logo.jpg","url":"https://...","tag":"logo"})`

### Setting Brand Colors

Specify themes and colors using `@SeedeTheme`:
`Design description...@SeedeTheme({"value":"midnight","colors":["#1E293B","#0F172A"]})`

### Reference Image Generation

Use `@SeedeReferenceImage` to guide design style or layout:
`@SeedeReferenceImage(url:"...", tag:"style,layout")`

## Workflow

1. **(Optional) Upload Assets**: Obtain asset URL.
2. **Create Task**: Call `/api/task/create` to get `task_id`.
3. **Wait for Completion**: Poll `GET /api/task/:id` until the task status is completed.
4. **Get Outputs**:
   - **Design Image**: `urls.image`
   - **Edit Link**: `urls.project` (requires login to access)
   - **HTML Code**: `/api/task/:id/html`

## Useful Tips

1. **Response Time**: Task generation usually takes 30-90 seconds, please ensure there is timeout handling.
2. **Image Format**: webp is recommended for smaller size and faster loading speed.
3. **Model Selection**: `gemini-3-flash` is used by default, available models can be viewed via `GET /api/task/models`.
4. **Embedded Editing**: You can use `https://seede.ai/design-embed/{projectId}?token={token}` to embed the editor in your application.

---

Built by **SeedeAI** for the OpenClaw community 🦞
