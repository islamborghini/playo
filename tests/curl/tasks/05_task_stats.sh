#!/bin/bash

# Test: Get Task Stats
# GET /api/tasks/stats

echo "📊 Testing Get Task Stats..."
echo "============================"

# Load access token from authentication test
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./tests/curl/auth/02_login.sh"
    exit 1
fi

echo "Fetching task statistics..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "http://localhost:3000/api/tasks/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Get task stats successful!"
    
    TOTAL_COMPLETED=$(echo "$BODY" | jq '.data.stats.totalCompleted')
    TOTAL_XP=$(echo "$BODY" | jq '.data.stats.totalXPGained')
    
    echo "Total Completed Tasks: $TOTAL_COMPLETED"
    echo "Total XP Gained: $TOTAL_XP"
else
    echo "❌ Get task stats failed!"
fi

echo ""