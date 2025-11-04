#!/bin/bash

# Test: Update Task
# PUT /api/tasks/:id

echo "✏️  Testing Update Task..."
echo "========================="

# Load access token from authentication test
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./tests/curl/auth/02_login.sh"
    exit 1
fi

# Load task ID from create task test
if [ -f /tmp/test_task_id.txt ]; then
    TASK_ID=$(cat /tmp/test_task_id.txt)
    echo "Using task ID from previous test: $TASK_ID"
else
    echo "❌ No task ID found. Please run create task test first."
    echo "Run: ./tests/curl/tasks/01_create_task.sh"
    exit 1
fi

echo "Updating task: $TASK_ID"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT "http://localhost:3000/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enhanced Morning Workout",
    "description": "45-minute intense cardio and strength training with stretching",
    "difficulty": "HARD",
    "category": "fitness"
  }')

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Task update successful!"
    
    UPDATED_TITLE=$(echo "$BODY" | jq -r '.data.task.title')
    UPDATED_DIFFICULTY=$(echo "$BODY" | jq -r '.data.task.difficulty')
    
    echo "Updated Title: $UPDATED_TITLE"
    echo "Updated Difficulty: $UPDATED_DIFFICULTY"
else
    echo "❌ Task update failed!"
fi

echo ""