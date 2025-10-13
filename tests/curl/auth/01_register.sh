#!/bin/bash

# Test: User Registration
# POST /api/auth/register

echo "🧪 Testing User Registration..."
echo "================================"

# Test data
EMAIL="testuser_$(date +%s)@example.com"
USERNAME="testuser_$(date +%s)"
PASSWORD="securePassword123"

echo "Registering user:"
echo "Email: $EMAIL"
echo "Username: $USERNAME"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"username\": \"$USERNAME\", 
    \"password\": \"$PASSWORD\",
    \"displayName\": \"Test User\"
  }")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 201 ]; then
    echo "✅ Registration successful!"
    
    # Save credentials for other tests
    echo "$EMAIL" > /tmp/test_email.txt
    echo "$PASSWORD" > /tmp/test_password.txt
    
    # Extract tokens (correct path: data.tokens.*)
    ACCESS_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.accessToken')
    REFRESH_TOKEN=$(echo "$BODY" | jq -r '.data.tokens.refreshToken')
    
    echo "$ACCESS_TOKEN" > /tmp/test_access_token.txt
    echo "$REFRESH_TOKEN" > /tmp/test_refresh_token.txt
    
    echo "Tokens saved to /tmp for other tests"
else
    echo "❌ Registration failed!"
fi

echo ""