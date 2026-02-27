# OLMS - Online Course Management System
## Quick Start Guide

### ✅ Both Servers Running

**Backend (Django):** http://127.0.0.1:8000  
**Frontend:** http://localhost:8001

---

## 🧪 Quick Test

### 1. **Login Page**
```
http://localhost:8001/login.html
```

**Credentials:**
- Email: `demo@olms.test`
- Password: `password123`

### 2. **Dashboard** (after login)
```
http://localhost:8001/dashboard.html
```

### 3. **API Test** (view courses)
```
http://127.0.0.1:8000/api/courses/
```

---

## 🔧 If Page Doesn't Load

**Try these steps:**

1. **Close browser completely**
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Open InPrivate/Incognito window**
4. **Type URL carefully:**
   ```
   http://localhost:8001/login.html
   ```
   (NOT https:// - use http://)

5. **Wait 3-5 seconds for page to load**

6. **If still blank:**
   - Open DevTools (F12)
   - Go to Console tab
   - Copy any red error messages
   - Tell me what you see

---

## 📝 What Should You See

**On login.html:**
- Dark centered card with "OLMS" logo
- "Welcome back" heading  
- Email input field
- Password input field
- Blue "Sign in" button

**After logging in:**
- Redirects to dashboard.html
- Shows course cards in a grid
- Navigation buttons at the top

---

## 🐛 Server Status

- **Backend:** ✓ Running at `http://127.0.0.1:8000` (port 8000)
- **Frontend:** ✓ Running at `http://localhost:8001` (port 8001)
- **Database:** ✓ Connected (PostgreSQL)
- **Demo User:** ✓ Created (`demo@olms.test` / `password123`)

---

## 🚀 All Features Implemented

✅ JWT Login Authentication  
✅ Dashboard with course browser  
✅ Enroll in courses  
✅ View my courses  
✅ User profile  
✅ Dashboard stats  
✅ Responsive design  
✅ Error handling with toast notifications
