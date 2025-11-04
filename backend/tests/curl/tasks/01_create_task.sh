#!/bin/bash

# Test: Create Task
# POST /api/tasks

echo "📝 Testing Create Task..."
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

echo "Creating a new task..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Workout",
    "description": "30-minute cardio and strength training session",
    "type": "DAILY",
    "difficulty": "MEDIUM",
    "category": "fitness"
  }')

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 201 ]; then
    echo "✅ Task creation successful!"
    
    # Save task ID for other tests
    TASK_ID=$(echo "$BODY" | jq -r '.data.task.id')
    echo "$TASK_ID" > /tmp/test_task_id.txt
    
    echo "Task ID saved to /tmp for other tests: $TASK_ID"
else
    echo "❌ Task creation failed!"
fi

echo ""