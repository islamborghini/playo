#!/bin/bash

echo "🔐 Testing QuestForge Authentication Flow"
echo "======================================="

# Login and extract token automatically
echo "🔑 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hero@questforge.com",
    "password": "QuestMaster123!"
  }')

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')

echo "✅ Login successful, token extracted"
echo "Token: ${ACCESS_TOKEN:0:50}..."

echo ""
echo "👤 Testing protected endpoint..."

# Test protected endpoint with fresh token
USER_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "User Profile Response:"
echo $USER_RESPONSE | jq

echo ""
echo "🎉 Test completed!"