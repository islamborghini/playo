# Testing Authentication Flow

## ✅ Step 7 Complete: Functional Login & Register Pages

### **What's Implemented:**

#### **Login Page** (`/login`)
- ✅ Email input field
- ✅ Password input field  
- ✅ "Login" button with loading state
- ✅ Error message display (red alert)
- ✅ "Don't have an account? Register" link
- ✅ "Back to Demo" link
- ✅ Redirects to `/dashboard` on success
- ✅ Form validation (required fields)
- ✅ Disabled inputs during loading

#### **Register Page** (`/register`)
- ✅ Email input field
- ✅ Username input field
- ✅ Character Name input field
- ✅ Password input field (min 6 chars)
- ✅ "Create Hero" button with loading state
- ✅ Error message display (red alert)
- ✅ "Already have an account? Login" link
- ✅ "Back to Demo" link
- ✅ Redirects to `/dashboard` on success
- ✅ Form validation

---

## **How to Test:**

### **1. Start Backend Server**
```bash
cd /Users/islam/playo
npm run backend
```
Backend should be running on `http://localhost:3000`

### **2. Start Frontend Server**
```bash
cd /Users/islam/playo/frontend
npm run dev
```
Frontend running on `http://localhost:5174/`

### **3. Test Registration Flow**
1. Visit: `http://localhost:5174/`
2. Click **"Login"** button
3. Click **"Register here"** link
4. Fill in the form:
   - Email: `test@playo.com`
   - Username: `testhero`
   - Character Name: `Sir Test`
   - Password: `password123`
5. Click **"⚔️ Create Hero"**
6. Watch for:
   - Button shows "Creating Hero..." with spinning sword
   - On success: Redirects to `/dashboard`
   - On error: Red alert message appears

### **4. Test Login Flow**
1. Click **"Login here"** link (or visit `/login`)
2. Fill in the form:
   - Email: `test@playo.com`
   - Password: `password123`
3. Click **"⚔️ Login"**
4. Watch for:
   - Button shows "Logging in..." with spinning sword
   - On success: Redirects to `/dashboard`
   - Token saved in localStorage
   - On error: Red alert message appears

### **5. Test Auto-Login (Persistence)**
1. After logging in, refresh the page
2. Should remain logged in (no redirect to login)
3. Check browser DevTools → Application → Local Storage → `token`

### **6. Test Protected Routes**
1. **Without logging in**, try to visit:
   - `http://localhost:5174/dashboard` → Redirects to `/login`
   - `http://localhost:5174/tasks` → Redirects to `/login`
   - `http://localhost:5174/character` → Redirects to `/login`
2. **After logging in**, should access these pages

### **7. Test Logout**
1. In the Dashboard (once implemented), click Logout
2. Should redirect to `/login`
3. Token removed from localStorage
4. Cannot access protected routes

---

## **Expected Behavior:**

### **✅ Success Case (Login)**
```
1. User enters correct credentials
2. Button shows loading state (spinning icon)
3. API call to POST /api/auth/login
4. Response: { success: true, data: { token: "...", user: {...} } }
5. Token saved to localStorage
6. User data stored in AuthContext
7. Redirect to /dashboard
```

### **❌ Error Case (Wrong Password)**
```
1. User enters wrong password
2. Button shows loading state
3. API call fails with 401 Unauthorized
4. Error message displays: "Login failed. Please check your credentials."
5. User remains on login page
```

### **❌ Error Case (Network Error)**
```
1. Backend server is down
2. API call fails
3. Error message displays: "Login failed. Please check your credentials."
4. User can try again
```

---

## **Testing with Backend API:**

Make sure your backend has these endpoints:

### **POST /api/auth/register**
```json
Request:
{
  "email": "test@playo.com",
  "username": "testhero",
  "characterName": "Sir Test",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@playo.com",
      "username": "testhero",
      "characterName": "Sir Test"
    }
  },
  "message": "User registered successfully"
}
```

### **POST /api/auth/login**
```json
Request:
{
  "email": "test@playo.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@playo.com",
      "username": "testhero",
      "level": 1,
      "xp": 0
    }
  },
  "message": "Login successful"
}
```

### **GET /api/auth/me**
```json
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@playo.com",
    "username": "testhero",
    "level": 5,
    "xp": 350
  }
}
```

---

## **Troubleshooting:**

### **Issue: "Login failed" error immediately**
- **Cause**: Backend not running
- **Fix**: Start backend with `npm run backend`

### **Issue: CORS errors in console**
- **Cause**: Backend CORS not configured
- **Fix**: Add CORS middleware in backend

### **Issue: Token not persisting**
- **Cause**: localStorage not saving
- **Fix**: Check browser console for errors

### **Issue: Redirects to login after refresh**
- **Cause**: Token expired or `/auth/me` endpoint failing
- **Fix**: Check backend JWT validation

---

## **Next Steps:**
- ✅ Login page functional
- ✅ Register page functional
- ✅ Error handling working
- ✅ Loading states working
- ⏳ Need to implement Dashboard page
- ⏳ Need to implement Logout button in navigation
