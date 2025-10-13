#!/bin/bash

# QuestForge API Test Suite - Complete cURL Test Runner
# This script runs all API endpoint tests in the correct order

set -e  # Exit on any error

echo "🚀 QuestForge API Test Suite"
echo "============================"
echo "Testing all available endpoints..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_script=$1
    local test_name=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${BLUE}Running: $test_name${NC}"
    
    if [ -f "$test_script" ]; then
        chmod +x "$test_script"
        if "$test_script"; then
            PASSED_TESTS=$((PASSED_TESTS + 1))
            echo -e "${GREEN}✅ $test_name PASSED${NC}"
        else
            FAILED_TESTS=$((FAILED_TESTS + 1))
            echo -e "${RED}❌ $test_name FAILED${NC}"
        fi
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ Test script not found: $test_script${NC}"
    fi
    
    echo ""
}

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s -f http://localhost:3000/api/users > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on localhost:3000${NC}"
else
    echo -e "${RED}❌ Server is not running on localhost:3000${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi
echo ""

# Clean up any existing test files
echo "🧹 Cleaning up previous test data..."
rm -f /tmp/test_*.txt
echo "Clean up complete"
echo ""

# Run Info Endpoint Tests (no authentication required)
echo -e "${YELLOW}📋 TESTING INFO ENDPOINTS${NC}"
echo "================================="
run_test "./tests/curl/info/users_info.sh" "Users Info Endpoint"
run_test "./tests/curl/info/tasks_info.sh" "Tasks Info Endpoint" 
run_test "./tests/curl/info/stories_info.sh" "Stories Info Endpoint"

# Run Authentication Tests (in sequence due to dependencies)
echo -e "${YELLOW}🔐 TESTING AUTHENTICATION ENDPOINTS${NC}"
echo "======================================="
run_test "./tests/curl/auth/01_register.sh" "User Registration"
run_test "./tests/curl/auth/02_login.sh" "User Login"
run_test "./tests/curl/auth/03_refresh.sh" "Token Refresh"
run_test "./tests/curl/auth/04_get_current_user.sh" "Get Current User"
run_test "./tests/curl/auth/05_update_profile.sh" "Update Profile"
run_test "./tests/curl/auth/06_change_password.sh" "Change Password"
run_test "./tests/curl/auth/07_logout.sh" "User Logout"

# Test Summary
echo "======================================="
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "======================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Check the output above for details.${NC}"
    exit 1
fi