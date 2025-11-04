#!/bin/bash

# Test: Update Profile
# PUT /api/auth/profile

echo "📝 Testing Update Profile..."
echo "============================"

# Load access token from previous test
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./02_login.sh"
    exit 1
fi

NEW_DISPLAY_NAME="Updated Test User $(date +%H:%M:%S)"
echo "Updating display name to: $NEW_DISPLAY_NAME"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"displayName\": \"$NEW_DISPLAY_NAME\"
  }")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Profile update successful!"
else
    echo "❌ Profile update failed!"
fi

echo ""