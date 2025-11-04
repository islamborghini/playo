# playo API Test Suite

This directory contains comprehensive cURL tests for all available playo API endpoints.

## 📁 Directory Structure

```
tests/curl/
├── auth/                    # Authentication endpoint tests
│   ├── 01_register.sh      # User registration
│   ├── 02_login.sh         # User login  
│   ├── 03_refresh.sh       # Token refresh
│   ├── 04_get_current_user.sh # Get current user
│   ├── 05_update_profile.sh   # Update profile
│   ├── 06_change_password.sh  # Change password
│   └── 07_logout.sh           # User logout
├── info/                    # Info endpoint tests
│   ├── users_info.sh       # Users endpoint info
│   ├── tasks_info.sh       # Tasks endpoint info
│   └── stories_info.sh     # Stories endpoint info
├── run_all_tests.sh        # Master test runner
└── README.md               # This file
```

## 🚀 Quick Start

### Run All Tests
```bash
# Make sure your server is running on localhost:3000
npm run dev

# Run the complete test suite
chmod +x tests/curl/run_all_tests.sh
./tests/curl/run_all_tests.sh
```

### Run Individual Tests

#### Authentication Tests (run in order)
```bash
# 1. Register a new user
chmod +x tests/curl/auth/01_register.sh
./tests/curl/auth/01_register.sh

# 2. Login with credentials  
chmod +x tests/curl/auth/02_login.sh
./tests/curl/auth/02_login.sh

# 3. Refresh access token
chmod +x tests/curl/auth/03_refresh.sh
./tests/curl/auth/03_refresh.sh

# 4. Get current user info
chmod +x tests/curl/auth/04_get_current_user.sh
./tests/curl/auth/04_get_current_user.sh

# 5. Update user profile
chmod +x tests/curl/auth/05_update_profile.sh  
./tests/curl/auth/05_update_profile.sh

# 6. Change password
chmod +x tests/curl/auth/06_change_password.sh
./tests/curl/auth/06_change_password.sh

# 7. Logout user
chmod +x tests/curl/auth/07_logout.sh
./tests/curl/auth/07_logout.sh
```

#### Info Endpoint Tests (no authentication required)
```bash
# Test users endpoint info
chmod +x tests/curl/info/users_info.sh
./tests/curl/info/users_info.sh

# Test tasks endpoint info  
chmod +x tests/curl/info/tasks_info.sh
./tests/curl/info/tasks_info.sh

# Test stories endpoint info
chmod +x tests/curl/info/stories_info.sh
./tests/curl/info/stories_info.sh
```

## 🔧 How It Works

### Token Management
- Registration and login tests save JWT tokens to `/tmp/test_*.txt` files
- Subsequent tests automatically load these tokens
- Tests are designed to run in sequence to maintain token state

### Test Data
- Registration creates unique users with timestamp-based emails/usernames
- Credentials are automatically saved and reused across tests
- Clean up happens automatically between test runs

### Error Handling
- Each test shows HTTP status codes and formatted JSON responses
- Tests use colored output to indicate success/failure
- Master test runner provides comprehensive summary

## 📋 Test Coverage

### ✅ Currently Tested Endpoints

**Authentication Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh ⭐ **This answers your question!**
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile  
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

**Info Endpoints:**
- `GET /api/users` - Users endpoint info
- `GET /api/tasks` - Tasks endpoint info  
- `GET /api/stories` - Stories endpoint info

### ❌ Not Yet Implemented
- Task management endpoints (CRUD operations)
- Story generation endpoints
- User profile management beyond basic updates

## 🎯 Testing the Refresh Token Endpoint

Your specific question about testing `/api/auth/refresh`:

```bash
# Quick test of refresh endpoint
./tests/curl/auth/02_login.sh    # Get tokens first
./tests/curl/auth/03_refresh.sh  # Test refresh endpoint
```

The refresh test (`03_refresh.sh`) will:
1. Load the refresh token from the login test
2. Send POST request to `/api/auth/refresh` 
3. Display the response with new access token
4. Save the new access token for other tests

## 📝 Prerequisites

- Server running on `localhost:3000`
- `jq` installed for JSON parsing (install with `brew install jq` on macOS)
- `curl` available (built into macOS/Linux)

## 🏃‍♂️ Example Usage

```bash
# Full test sequence
./tests/curl/run_all_tests.sh

# Just test authentication flow  
./tests/curl/auth/01_register.sh
./tests/curl/auth/02_login.sh
./tests/curl/auth/03_refresh.sh   # ← This is what you asked about!
```