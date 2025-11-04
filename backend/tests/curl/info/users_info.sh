#!/bin/bash

# Test: Users Info Endpoint
# GET /api/users

echo "ℹ️  Testing Users Info Endpoint..."
echo "=================================="

echo "Fetching users endpoint info..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET http://localhost:3000/api/users)

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Users info endpoint successful!"
else
    echo "❌ Users info endpoint failed!"
fi

echo ""