#!/bin/bash

echo "📝 QuestForge Task Management Test Suite"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    echo "----------------------------------------"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "$test_file" ]; then
        chmod +x "$test_file"
        if ./"$test_file"; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo -e "${RED}❌ $test_name - FAILED${NC}"
        fi
    else
        echo -e "${RED}❌ Test file not found: $test_file${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
    sleep 1
}

# Function to setup authentication
setup_auth() {
    echo -e "${BLUE}🔐 Setting up authentication for task tests...${NC}"
    
    # Check if we already have a valid token
    if [ -f /tmp/test_access_token.txt ]; then
        echo "✅ Using existing access token"
        return 0
    fi
    
    # Try to get credentials from auth tests
    if [ -f /tmp/test_email.txt ] && [ -f /tmp/test_password.txt ]; then
        EMAIL=$(cat /tmp/test_email.txt)
        PASSWORD=$(cat /tmp/test_password.txt)
        echo "📧 Using credentials from auth tests: $EMAIL"
    else
        # Fallback to default credentials
        EMAIL="test@example.com"
        PASSWORD="password123"
        echo "📧 Using default credentials: $EMAIL"
    fi
    
    # Login to get access token
    echo "🔑 Logging in to get access token..."
    
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\"
        }")
    
    # Extract access token
    ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')
    
    if [ "$ACCESS_TOKEN" != "null" ] && [ "$ACCESS_TOKEN" != "" ]; then
        echo "$ACCESS_TOKEN" > /tmp/test_access_token.txt
        echo -e "${GREEN}✅ Authentication successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Authentication failed. Please run auth tests first or check credentials.${NC}"
        echo "Login response: $LOGIN_RESPONSE"
        echo ""
        echo -e "${YELLOW}💡 Try running authentication tests first:${NC}"
        echo "  ./tests/curl/auth/run_auth_tests.sh"
        return 1
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3000/api/tasks > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Setup authentication
if ! setup_auth; then
    echo -e "${RED}❌ Failed to setup authentication. Exiting.${NC}"
    exit 1
fi
echo ""

# Clean up previous task test data (but keep auth tokens)
echo "🧹 Cleaning up previous task test data..."
rm -f /tmp/test_task_*.txt
echo "✅ Cleanup complete"
echo ""

# Run task tests in sequence
echo "🚀 Starting Task Management Tests..."
echo ""

run_test "01_create_task.sh" "Create Task"
run_test "02_get_tasks.sh" "Get Tasks (List & Filter)"
run_test "03_complete_task.sh" "Complete Task (XP & Progress)"
run_test "04_update_task.sh" "Update Task"
run_test "05_task_stats.sh" "Task Statistics"
run_test "06_delete_task.sh" "Delete Task (Soft Delete)"

# Test Summary
echo "================================================"
echo "🏁 Task Management Test Suite Complete"
echo "================================================"
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All task tests passed!${NC}"
    echo ""
    echo -e "${BLUE}📊 Task Management System Status:${NC}"
    echo -e "${GREEN}✅ Task Creation & Validation${NC}"
    echo -e "${GREEN}✅ Task Filtering & Retrieval${NC}"
    echo -e "${GREEN}✅ Task Completion & XP System${NC}"
    echo -e "${GREEN}✅ Task Updates & Modifications${NC}"
    echo -e "${GREEN}✅ Task Statistics & Analytics${NC}"
    echo -e "${GREEN}✅ Task Deletion & Cleanup${NC}"
    exit 0
else
    echo -e "${RED}💥 Some task tests failed.${NC}"
    echo -e "${YELLOW}💡 Try running individual tests to debug specific issues.${NC}"
    exit 1
fi