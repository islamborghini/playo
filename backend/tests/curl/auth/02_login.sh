#!/bin/bash

# Test: User Login
# POST /api/auth/login

echo "🔑 Testing User Login..."
echo "========================"

# Load credentials from registration test
if [ -f /tmp/test_email.txt ] && [ -f /tmp/test_password.txt ]; then
    EMAIL=$(cat /tmp/test_email.txt)
    PASSWORD=$(cat /tmp/test_password.txt)
    echo "Using credentials from registration test"
else
    # Fallback to default test credentials
    EMAIL="test@example.com"
    PASSWORD="password123"
    echo "Using default test credentials"
fi

echo "Email: $EMAIL"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Login successful!"
    
    # Extract and save tokens for other tests (correct path: data.tokens.*)
    ACCESS_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.accessToken')
    REFRESH_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.refreshToken')
    
    echo "$ACCESS_TOKEN" > /tmp/test_access_token.txt
    echo "$REFRESH_TOKEN" > /tmp/test_refresh_token.txt
    
    echo "Tokens updated in /tmp for other tests"
else
    echo "❌ Login failed!"
fi

echo ""