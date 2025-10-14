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
AUTH_PASSED=0
AUTH_FAILED=0
TASK_PASSED=0
TASK_FAILED=0

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

# Run Authentication Test Suite
echo -e "${YELLOW}🔐 RUNNING AUTHENTICATION TEST SUITE${NC}"
echo "======================================"
cd tests/curl/auth
if ./run_auth_tests.sh; then
    echo -e "${GREEN}✅ Authentication Test Suite - PASSED${NC}"
    AUTH_PASSED=1
else
    echo -e "${RED}❌ Authentication Test Suite - FAILED${NC}"
    AUTH_FAILED=1
fi
cd ../../../

# Run Task Management Test Suite  
echo -e "${YELLOW}📝 RUNNING TASK MANAGEMENT TEST SUITE${NC}"
echo "====================================="
cd tests/curl/tasks
if ./run_task_tests.sh; then
    echo -e "${GREEN}✅ Task Management Test Suite - PASSED${NC}"
    TASK_PASSED=1
else
    echo -e "${RED}❌ Task Management Test Suite - FAILED${NC}"
    TASK_FAILED=1
fi
cd ../../../

# Test Summary
echo "======================================="
echo -e "${BLUE}📊 COMPLETE TEST SUMMARY${NC}"
echo "======================================="
echo "Info Endpoint Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [ ${AUTH_PASSED:-0} -eq 1 ]; then
    echo -e "🔐 Authentication Suite: ${GREEN}PASSED${NC}"
else
    echo -e "🔐 Authentication Suite: ${RED}FAILED${NC}"
fi

if [ ${TASK_PASSED:-0} -eq 1 ]; then
    echo -e "📝 Task Management Suite: ${GREEN}PASSED${NC}"
else
    echo -e "📝 Task Management Suite: ${RED}FAILED${NC}"
fi

echo ""
TOTAL_SUITE_FAILURES=$((FAILED_TESTS + AUTH_FAILED + TASK_FAILED))

if [ $TOTAL_SUITE_FAILURES -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TEST SUITES PASSED SUCCESSFULLY!${NC}"
    echo -e "${BLUE}🎮 QuestForge API Status: FULLY OPERATIONAL${NC}"
    echo -e "${GREEN}✅ Authentication & Authorization${NC}"
    echo -e "${GREEN}✅ Task Management & RPG System${NC}"
    echo -e "${GREEN}✅ API Documentation Endpoints${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Ready for production deployment!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  SOME TEST SUITES FAILED${NC}"
    echo -e "${YELLOW}💡 Run individual test suites for detailed debugging:${NC}"
    echo "  • ./tests/curl/auth/run_auth_tests.sh"
    echo "  • ./tests/curl/tasks/run_task_tests.sh"
    exit 1
fi