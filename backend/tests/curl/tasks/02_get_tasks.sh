#!/bin/bash

# Test: Get Tasks
# GET /api/tasks

echo "📋 Testing Get Tasks..."
echo "======================="

# Load access token from authentication test
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./tests/curl/auth/02_login.sh"
    exit 1
fi

echo "Fetching user tasks..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Get tasks successful!"
    
    TASK_COUNT=$(echo "$BODY" | jq '.data.count')
    echo "Found $TASK_COUNT tasks"
else
    echo "❌ Get tasks failed!"
fi

echo ""

# Test with filters
echo "Testing with filters (type=DAILY)..."
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3000/api/tasks?type=DAILY&isActive=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Filtered Response:"
echo "$BODY" | jq .

echo ""