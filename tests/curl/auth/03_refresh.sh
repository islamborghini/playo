#!/bin/bash

# Test: Refresh Token
# POST /api/auth/refresh

echo "🔄 Testing Token Refresh..."
echo "==========================="

# Load refresh token from previous test
if [ -f /tmp/test_refresh_token.txt ]; then
    REFRESH_TOKEN=$(cat /tmp/test_refresh_token.txt)
    echo "Using refresh token from previous test"
else
    echo "❌ No refresh token found. Please run login test first."
    echo "Run: ./02_login.sh"
    exit 1
fi

echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Token refresh successful!"
    
    # Update access token with new one (correct path: data.tokens.accessToken)
    NEW_ACCESS_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.accessToken')
    echo "$NEW_ACCESS_TOKEN" > /tmp/test_access_token.txt
    
    echo "New access token saved to /tmp for other tests"
else
    echo "❌ Token refresh failed!"
fi

echo ""