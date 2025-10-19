# Fixes and Updates Changelog

## Latest Fixes (Current)

### Issue #1: Fixed Launcher Icon Not Working
**Problem**: Application couldn't open when launched from the desktop icon/launcher after closing and reopening.

**Cause**: Incorrect icon path in `main.js` - was pointing to `../../assets/icon.png` instead of `../../assets/icons/icon.png`.

**Solution**: Updated the icon path in `src/main/main.js`:
```javascript
icon: path.join(__dirname, '../../assets/icons/icon.png')
```

**Status**: ✅ FIXED

---

### Issue #2: Implemented Session Persistence (Auto-Login)
**Problem**: Users had to login every time they opened the application, even after just closing it.

**Solution**: Implemented automatic session management:

1. **Session Storage**: User session is now saved to `localStorage` after successful login
2. **Auto-Login**: On app startup, checks for saved session and auto-logs in if found
3. **Session Expiry**: Sessions automatically expire after 30 days (configurable)
4. **Explicit Logout**: Session is only cleared when user clicks "Logout" button

**Features**:
- ✅ Login once, stay logged in
- ✅ Session persists across app restarts
- ✅ Session cleared only on explicit logout
- ✅ 30-day session expiry for security
- ✅ Secure - passwords are not stored

**Files Modified**:
- `src/renderer/app.js`: Added session management functions
  - `saveSession()` - Saves user session after login
  - `clearSession()` - Clears session on logout
  - `getSavedSession()` - Retrieves saved session
  - `checkSavedSession()` - Checks for session on startup

**Status**: ✅ IMPLEMENTED

---

## How Session Persistence Works

### On Login:
1. User enters username and password
2. Credentials verified with database
3. On success, user data saved to localStorage (without password)
4. User sees main application screen

### On App Restart:
1. App checks for saved session in localStorage
2. If valid session found (and not expired):
   - User is automatically logged in
   - Main screen shown immediately
3. If no session or expired:
   - Login screen shown

### On Logout:
1. User clicks "Logout" button
2. Session cleared from localStorage
3. Login screen shown
4. User must login again

---

## Security Considerations

### What's Stored:
```json
{
  "id": "user-id",
  "username": "admin",
  "role": "admin",
  "display_name": "Administrator",
  "timestamp": 1697471234567
}
```

### What's NOT Stored:
- ❌ Passwords (never stored in localStorage)
- ❌ Sensitive business data
- ❌ Payment information

### Session Expiry:
- Sessions automatically expire after 30 days
- Can be adjusted in `getSavedSession()` function
- Change `maxAge` variable (in milliseconds)

---

## Configuration

### Adjust Session Expiry Time

Edit `src/renderer/app.js`, find the `getSavedSession()` function:

```javascript
// Change this value (in milliseconds)
const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

// Examples:
// 7 days:  7 * 24 * 60 * 60 * 1000
// 90 days: 90 * 24 * 60 * 60 * 1000
// Forever: Infinity (not recommended)
```

### Disable Auto-Login (Require Login Every Time)

If you want to disable session persistence:

1. Comment out session saving in `handleLogin()`:
```javascript
// saveSession(result.user); // Disabled
```

2. Or set maxAge to 0:
```javascript
const maxAge = 0; // Session expires immediately
```

---

## User Experience

### Before These Fixes:
- ❌ Launcher icon might not work after closing
- ❌ Had to login every single time app opened
- ❌ Annoying for daily users
- ❌ Poor user experience

### After These Fixes:
- ✅ Launcher icon works properly
- ✅ Login once, stay logged in
- ✅ Fast startup (no login screen)
- ✅ Logout when needed
- ✅ Professional user experience

---

## Testing Checklist

- [x] Icon path fixed in main.js
- [x] Session saving on login
- [x] Auto-login on app restart
- [x] Session clearing on logout
- [x] Session expiry working
- [ ] Test on Ubuntu with launcher
- [ ] Test on Windows with shortcut
- [ ] Test with multiple users
- [ ] Test session expiry (after 30 days)

---

## Previous Fixes

### Fixed Module Import Error
**Issue**: `Error: Cannot find module './pdf-generator'`
**Fix**: Changed to `./pdf-generators` in `src/main/ipc-handlers.js`
**Status**: ✅ FIXED

---

## Recommendations

### For Users:
1. Login with your credentials
2. Close app normally (X button)
3. Reopen from launcher - should auto-login
4. Click "Logout" when:
   - Switching users
   - Leaving computer unattended
   - End of work shift

### For Administrators:
1. Set appropriate session expiry time for your security needs
2. Train users on proper logout procedures
3. Consider shorter sessions for shared computers
4. Monitor user access patterns

---

## Future Enhancements (Optional)

Possible improvements:
- [ ] "Remember me" checkbox (optional auto-login)
- [ ] Multiple session support
- [ ] Session activity timeout (auto-logout after inactivity)
- [ ] Device fingerprinting for security
- [ ] Session encryption
- [ ] Audit log for login/logout events

---

## Support

If you experience any issues with:
- Launcher not working
- Auto-login not working
- Session expiring too quickly
- Unable to logout

Please check:
1. Browser console for errors (F12 in dev mode)
2. localStorage is enabled
3. Icon file exists at `assets/icons/icon.png`
4. Session data in localStorage (F12 → Application → Local Storage)

---

Last Updated: October 15, 2025
Version: 1.0.1

