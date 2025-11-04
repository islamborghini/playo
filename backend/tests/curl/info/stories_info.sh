#!/bin/bash

# Test: Stories Info Endpoint
# GET /api/stories

echo "ℹ️  Testing Stories Info Endpoint..."
echo "==================================="

echo "Fetching stories endpoint info..."
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET http://localhost:3000/api/stories)

# Extract HTTP status and body
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$BODY" | jq .

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Stories info endpoint successful!"
else
    echo "❌ Stories info endpoint failed!"
fi

echo ""