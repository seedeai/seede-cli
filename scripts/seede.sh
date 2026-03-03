#!/bin/bash
# Seede AI CLI Helper
# Usage: seede.sh <command> [args]

set -e
set -o pipefail

# API Base URL
BASE_URL="https://api.seede.ai"

# Get API Token from environment
get_token() {
    if [ -z "$SEEDE_API_TOKEN" ]; then
        echo "❌ SEEDE_API_TOKEN environment variable is not set." >&2
        echo "   Run: export SEEDE_API_TOKEN='your_token'" >&2
        return 1
    fi
    echo "$SEEDE_API_TOKEN"
}

api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token
    token=$(get_token) || return 1
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: $token" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: $token"
    fi
}

has_cmd() {
    command -v "$1" >/dev/null 2>&1
}

json_pretty() {
    if has_cmd jq; then
        jq .
        return
    fi
    python3 -c 'import json,sys; s=sys.stdin.read();\nif not s.strip(): raise SystemExit(1)\nprint(json.dumps(json.loads(s), indent=2, ensure_ascii=False))'
}

json_get() {
    local path="$1"
    if has_cmd jq; then
        jq -r ".$path"
        return
    fi
    python3 -c '
import json,sys
path = sys.argv[1].split(".")
s = sys.stdin.read()
if not s.strip():
    raise SystemExit(1)
data = json.loads(s)
for p in path:
    if not isinstance(data, dict):
        data = None
        break
    data = data.get(p)
if data is None:
    print("null")
elif isinstance(data, (dict, list)):
    print(json.dumps(data, ensure_ascii=False))
else:
    print(str(data))
' "$path"
}

json_tasks_summary() {
    if has_cmd jq; then
        jq ".[] | {id, name, status, created_at}"
        return
    fi
    python3 -c '
import json,sys
s = sys.stdin.read()
if not s.strip():
    raise SystemExit(1)
data = json.loads(s)
if not isinstance(data, list):
    print(json.dumps(data, ensure_ascii=False))
    raise SystemExit(0)
keys = ("id", "name", "status", "created_at")
for item in data:
    if not isinstance(item, dict):
        continue
    out = {k: item.get(k) for k in keys}
    print(json.dumps(out, ensure_ascii=False))
'
}

case "$1" in
    tasks|list)
        echo "📋 Listing design tasks..."
        api GET "/api/task" | json_tasks_summary
        ;;
    
    get)
        if [ -z "$2" ]; then
            echo "Usage: seede.sh get <task_id>"
            exit 1
        fi
        api GET "/api/task/$2" | json_pretty
        ;;
    
    create)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: seede.sh create <name> <prompt> [width] [height]"
            echo "Example: seede.sh create 'Post' 'A futuristic city' 1080 1440"
            exit 1
        fi
        NAME="$2"
        PROMPT="$3"
        WIDTH="${4:-1080}"
        HEIGHT="${5:-1440}"
        
        echo "🎨 Creating design task..."
        RESULT=$(api POST "/api/task/create" "{\"name\": \"$NAME\", \"prompt\": \"$PROMPT\", \"size\": {\"w\": $WIDTH, \"h\": $HEIGHT}}")
        TASK_ID=$(echo "$RESULT" | json_get "id")
        
        if [ "$TASK_ID" = "null" ]; then
            echo "❌ Failed to create task"
            echo "$RESULT" | json_pretty
            exit 1
        fi
        
        echo "Task ID: $TASK_ID"
        echo "Polling for completion (30-90s)..."
        
        for i in {1..45}; do
            sleep 3
            STATUS=$(api GET "/api/task/$TASK_ID")
            STATE=$(echo "$STATUS" | json_get "status")
            
            if [ "$STATE" = "completed" ] || [ "$STATE" = "success" ]; then
                IMAGE_URL=$(echo "$STATUS" | json_get "urls.image")
                PROJECT_URL=$(echo "$STATUS" | json_get "urls.project")
                echo "✅ Task complete!"
                echo "🖼️ Image URL: $IMAGE_URL"
                echo "🔗 Project URL: $PROJECT_URL"
                exit 0
            elif [ "$STATE" = "failed" ] || [ "$STATE" = "error" ]; then
                echo "❌ Task failed"
                echo "$STATUS" | json_pretty
                exit 1
            fi
            echo "  Status: $STATE..."
        done
        echo "⏰ Timeout waiting for task completion"
        ;;
    
    upload)
        if [ -z "$2" ]; then
            echo "Usage: seede.sh upload <file_path>"
            exit 1
        fi
        FILENAME=$(basename "$2")
        MIME_TYPE=$(file --mime-type -b "$2")
        DATA_URL="data:$MIME_TYPE;base64,$(base64 -i "$2")"
        
        echo "📤 Uploading $FILENAME..."
        api POST "/asset" "{\"name\": \"$FILENAME\", \"contentType\": \"$MIME_TYPE\", \"dataURL\": \"$DATA_URL\"}" | json_pretty
        ;;
    
    models)
        echo "📋 Available models:"
        api GET "/api/task/models" | json_pretty
        ;;
    
    *)
        echo "🌱 Seede AI CLI Helper"
        echo ""
        echo "Commands:"
        echo "  tasks           List all tasks"
        echo "  get <id>        Get task details"
        echo "  create <name> <prompt> [w] [h]  Create new design"
        echo "  upload <file>   Upload asset (image/logo)"
        echo "  models          List available models"
        echo ""
        echo "Environment Variables:"
        echo "  export SEEDE_API_TOKEN='your_token'"
        ;;
esac
