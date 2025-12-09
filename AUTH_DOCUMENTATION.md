# Authentication System Documentation

## Overview

The Ggomruk client now has a complete authentication system integrated with the API server, supporting both traditional email/password login and Google OAuth.

## Features

✅ **User Registration** - Full validation with password strength requirements
✅ **User Login** - Email/password authentication with JWT tokens
✅ **Google OAuth** - One-click sign-in with Google
✅ **Protected Routes** - Automatic redirection for unauthenticated users
✅ **JWT Token Management** - Automatic token storage and injection
✅ **Session Persistence** - Token verification on page reload
✅ **Logout Functionality** - Clear session and redirect to login

---

## Architecture

### File Structure

```
ggomruk_client/
├── app/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state management
│   ├── services/
│   │   └── authService.ts           # API calls for authentication
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── signup/
│   │   └── page.tsx                 # Signup page
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx             # OAuth callback handler
│   ├── app/
│   │   ├── layout.tsx               # Protected layout wrapper
│   │   ├── ProtectedLayout.tsx      # Authentication check
│   │   └── _components/
│   │       └── Navbar.tsx           # Updated with auth UI
│   ├── layout.tsx                   # Root layout with AuthProvider
│   └── page.tsx                     # Home page with redirect logic
└── .env.sample                      # Environment variables template
```

---

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the client root:

```bash
# Copy the sample file
cp .env.sample .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## User Flow

### Registration Flow

1. User navigates to `/signup`
2. Fills out form with:
   - Username (min 8 chars, must include uppercase, lowercase, number, special char)
   - Email (valid email format)
   - Password (min 8 chars, must include uppercase, lowercase, number, special char)
   - Confirm Password
3. Client-side validation checks all requirements
4. On submit, calls `POST /api/auth/signup`
5. API returns JWT token and user data
6. Token stored in localStorage
7. User redirected to `/app`

### Login Flow

1. User navigates to `/login`
2. Enters username and password
3. On submit, calls `POST /api/auth/login`
4. API validates credentials and returns JWT token
5. Token stored in localStorage
6. User redirected to `/app`

### Google OAuth Flow

1. User clicks "Sign in with Google" button
2. Redirects to `http://localhost:4000/api/auth/google`
3. API redirects to Google OAuth consent screen
4. User grants permission
5. Google redirects to `http://localhost:4000/api/auth/google/callback`
6. API processes OAuth, creates/finds user, generates JWT
7. Redirects to `http://localhost:3000/auth/callback?token=<JWT>`
8. Callback page stores token and redirects to `/app`

### Protected Route Access

1. User tries to access `/app/*`
2. `ProtectedLayout` checks for valid token
3. If no token → redirect to `/login`
4. If token exists → verify with API
5. If valid → render page
6. If invalid → clear token, redirect to `/login`

### Logout Flow

1. User clicks "Logout" in navbar
2. Calls `POST /api/auth/signout` with token
3. Removes token from localStorage
4. Redirects to `/login`

---

## API Integration

### AuthContext Methods

```typescript
const { 
  user,              // Current user object
  token,             // JWT token
  loading,           // Loading state
  login,             // Login function
  signup,            // Signup function
  logout,            // Logout function
  loginWithGoogle,   // Google OAuth redirect
  isAuthenticated    // Boolean auth status
} = useAuth();
```

### Using in Components

```tsx
'use client';

import { useAuth } from '../contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls

The axios instance automatically includes JWT tokens:

```typescript
import axiosInstance from '../app/_api/axios';

// Token is automatically added to headers
const response = await axiosInstance.post('/algo/backtest', {
  symbol: 'BTCUSDT',
  // ... other params
});
```

---

## API Endpoints

### Authentication Endpoints (from API Server)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signout` | Logout user | Yes |
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| GET | `/api/auth/verify` | Verify JWT token | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Request/Response Examples

#### Login Request
```json
POST /api/auth/login
{
  "username": "JohnDoe123!",
  "password": "SecurePass123!"
}
```

#### Login Response
```json
{
  "ok": 1,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "JohnDoe123!",
      "email": "john@example.com"
    }
  }
}
```

#### Signup Request
```json
POST /api/auth/signup
{
  "username": "JohnDoe123!",
  "password": "SecurePass123!",
  "email": "john@example.com"
}
```

---

## Validation Rules

### Username Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

### Email Requirements
- Valid email format (user@domain.com)

---

## Security Features

### Token Storage
- JWT tokens stored in `localStorage`
- Automatically included in all API requests via axios interceptor
- Removed on logout or authentication failure

### Token Verification
- Token verified on app load
- Invalid/expired tokens automatically cleared
- User redirected to login on verification failure

### Protected Routes
- All `/app/*` routes require authentication
- Automatic redirect to `/login` if not authenticated
- Loading state shown during authentication check

### Request Interceptors
- All API requests include `Authorization: Bearer <token>` header
- 401 responses automatically clear token and redirect to login

---

## Troubleshooting

### Issue: "Cannot find module '../contexts/AuthContext'"

**Solution:** Make sure you're using the context from the correct path:
```tsx
import { useAuth } from '../contexts/AuthContext';  // Adjust path as needed
```

### Issue: Google OAuth redirect fails

**Checklist:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in API server `.env`
2. Check `FRONTEND_URL` is set correctly in API server (default: `http://localhost:3000`)
3. Verify Google OAuth consent screen is configured with correct redirect URI

### Issue: Token not persisting after refresh

**Solution:** Check browser localStorage:
```javascript
// In browser console
localStorage.getItem('token')
```

If null, check if `AuthContext` is properly verifying the token on mount.

### Issue: Protected routes not redirecting

**Solution:** Ensure `ProtectedLayout` is wrapping your protected routes in `app/app/layout.tsx`

---

## Next Steps

### Recommended Enhancements

1. **Add "Remember Me" functionality**
   - Store token in both localStorage and sessionStorage
   - Let user choose session persistence

2. **Implement Password Reset**
   - Add "Forgot Password" link
   - Create email verification flow
   - Password reset page

3. **Add Email Verification**
   - Send verification email on signup
   - Verify email before allowing login
   - Resend verification option

4. **Improve Error Handling**
   - Better error messages for network failures
   - Retry logic for failed requests
   - Toast notifications for auth events

5. **Add Profile Management**
   - View/edit profile page
   - Change password functionality
   - Account deletion option

6. **Implement Refresh Tokens**
   - Add refresh token flow
   - Automatically refresh expired access tokens
   - Better session management

---

## Testing

### Manual Testing Checklist

- [ ] Can register new user with valid credentials
- [ ] Cannot register with invalid username/password
- [ ] Can login with correct credentials
- [ ] Cannot login with incorrect credentials
- [ ] Can login with Google OAuth
- [ ] Token persists after page refresh
- [ ] Can access protected routes when authenticated
- [ ] Cannot access protected routes when not authenticated
- [ ] Logout clears token and redirects to login
- [ ] Navbar shows username when logged in
- [ ] Navbar shows logout button when logged in

---

## Support

For issues or questions:
1. Check this documentation
2. Review API server authentication implementation
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Last Updated:** December 9, 2025
**Version:** 1.0.0
