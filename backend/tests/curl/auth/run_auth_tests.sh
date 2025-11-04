#!/bin/bash

echo "🔐 playo Authentication Test Suite"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3000/api/auth > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Clean up previous test data
echo "🧹 Cleaning up previous test data..."
rm -f /tmp/test_*.txt
echo "✅ Cleanup complete"
echo ""

# Run authentication tests in sequence
echo "🚀 Starting Authentication Tests..."
echo ""

run_test "01_register.sh" "User Registration"
run_test "02_login.sh" "User Login"
run_test "03_refresh.sh" "Token Refresh"
run_test "04_get_current_user.sh" "Get Current User"
run_test "05_update_profile.sh" "Update Profile"
run_test "06_change_password.sh" "Change Password"
run_test "07_logout.sh" "User Logout"

# Test Summary
echo "================================================"
echo "🏁 Authentication Test Suite Complete"
echo "================================================"
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All authentication tests passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some authentication tests failed.${NC}"
    exit 1
fi