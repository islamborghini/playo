#!/bin/bash

# Test: Change Password
# POST /api/auth/change-password

echo "🔐 Testing Change Password..."
echo "============================="

# Load access token and current password
if [ -f /tmp/test_access_token.txt ]; then
    ACCESS_TOKEN=$(cat /tmp/test_access_token.txt)
    echo "Using access token from previous test"
else
    echo "❌ No access token found. Please run login test first."
    echo "Run: ./02_login.sh"
    exit 1
fi

if [ -f /tmp/test_password.txt ]; then
    CURRENT_PASSWORD=$(cat /tmp/test_password.txt)
else
    CURRENT_PASSWORD="password123"
fi

NEW_PASSWORD="newSecurePassword123"
echo "Changing password from current to: $NEW_PASSWORD"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentPassword\": \"$CURRENT_PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\"
  }")

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Password change successful!"
    
    # Update saved password for future tests
    echo "$NEW_PASSWORD" > /tmp/test_password.txt
    echo "New password saved to /tmp for future tests"
else
    echo "❌ Password change failed!"
fi

echo ""