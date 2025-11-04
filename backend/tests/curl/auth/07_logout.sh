#!/bin/bash

# Test: Logout
# POST /api/auth/logout

echo "👋 Testing Logout..."
echo "==================="

# Load access token from previous test
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./02_login.sh"
    exit 1
fi

echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Logout successful!"
    
    # Clean up token files
    rm -f /tmp/test_access_token.txt
    rm -f /tmp/test_refresh_token.txt
    
    echo "Token files cleaned up"
else
    echo "❌ Logout failed!"
fi

echo ""