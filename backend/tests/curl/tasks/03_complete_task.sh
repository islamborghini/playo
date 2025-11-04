#!/bin/bash

# Test: Complete Task
# POST /api/tasks/:id/complete

echo "🎯 Testing Complete Task..."
echo "==========================="

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

echo "Completing task: $TASK_ID"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "http://localhost:3000/api/tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Task completion successful!"
    
    XP_GAINED=$(echo "$BODY" | jq '.data.xpGained')
    NEW_STREAK=$(echo "$BODY" | jq '.data.newStreak')
    STORY_UNLOCKED=$(echo "$BODY" | jq '.data.storyUnlocked')
    
    echo "XP Gained: $XP_GAINED"
    echo "New Streak: $NEW_STREAK"
    echo "Story Unlocked: $STORY_UNLOCKED"
    
    if [ "$(echo "$BODY" | jq 'has("newLevel")')" = "true" ]; then
        NEW_LEVEL=$(echo "$BODY" | jq '.data.newLevel')
        echo "🎉 Level Up! New Level: $NEW_LEVEL"
    fi
else
    echo "❌ Task completion failed!"
fi

echo ""