

# Fix: Forgot/Reset Password "Invalid Token" Issue

## Root Cause

The problem is a **race condition** between the Supabase JS SDK and the `ResetPassword` component's token validation logic.

Here is what happens step-by-step:

1. User clicks "Reset Password" in the email -- Supabase redirects to `/reset-password` with tokens (either `#access_token=...&type=recovery` or `?code=...`)
2. The Supabase JS SDK (initialized in `client.ts`) **automatically** detects these URL tokens and begins processing them internally via `onAuthStateChange`
3. **Simultaneously**, `ResetPassword.tsx`'s `useEffect` fires and tries to manually parse the same tokens
4. The SDK consumes/clears the tokens from the URL before the component can process them, OR `getSession()` returns null because the SDK hasn't finished processing yet
5. Result: the component finds no valid tokens and no session, so it shows "Invalid or Expired Link"

Additionally, the `AuthContext` already handles `PASSWORD_RECOVERY` events (line 134) and sets the session/user state. The ResetPassword page should leverage this instead of competing with the SDK.

## Solution

Rewrite `ResetPassword.tsx` to **stop manually parsing tokens** and instead rely on Supabase's built-in `onAuthStateChange` listener. The component will:

1. Subscribe to `onAuthStateChange` for the `PASSWORD_RECOVERY` or `SIGNED_IN` event
2. Wait up to ~5 seconds for the SDK to process the recovery tokens automatically
3. Fall back to `getSession()` check (for cases where the event already fired before the component mounted)
4. Show the password form once a valid session is detected

## Technical Changes

### File: `src/pages/ResetPassword.tsx`

Replace the `useEffect` token validation block (lines 50-179) with a simpler approach:

```text
useEffect(() => {
  let timeoutId: NodeJS.Timeout;

  // 1. Check if session already exists (event fired before mount)
  const checkExisting = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsValidToken(true);
      setIsValidating(false);
      return true;
    }
    return false;
  };

  // 2. Listen for PASSWORD_RECOVERY or SIGNED_IN events from the SDK
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          clearTimeout(timeoutId);
          setIsValidToken(true);
          setIsValidating(false);
        }
      }
    }
  );

  // 3. Check existing session first, then set a timeout fallback
  checkExisting().then((found) => {
    if (!found) {
      timeoutId = setTimeout(() => {
        // If no event fired within 5 seconds, token is invalid
        setIsValidToken(false);
        setIsValidating(false);
        setErrorMessage(
          'Invalid or missing reset token. Please request a new password reset link.'
        );
      }, 5000);
    }
  });

  return () => {
    clearTimeout(timeoutId);
    subscription.unsubscribe();
  };
}, []);
```

This eliminates all manual hash/query parsing, PKCE code exchange, and `verifyOtp` calls -- the SDK handles all of that automatically. The component just waits for the result.

### File: `src/contexts/AuthContext.tsx` (minor adjustment)

Ensure the `PASSWORD_RECOVERY` handler does NOT trigger `ensureUserHasOrganization` or any redirect. The current code already does this (line 134-137 returns early), so no change needed here.

### No database or edge function changes required.

## Summary

| What | Detail |
|------|--------|
| Files modified | `src/pages/ResetPassword.tsx` |
| Approach | Let Supabase SDK handle token exchange; component listens for auth events |
| Risk | None -- password update logic (`updateUser`) remains unchanged |
| Backward safe | Yes -- no DB, RLS, or API changes |

