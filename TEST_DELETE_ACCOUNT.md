# Testing Delete Account Functionality

## Before Testing

Make sure you've applied the database migration first! See `MANUAL_FIX_DELETE_ACCOUNT.md` for instructions.

## Test Steps

### 1. Create a Test Account (Optional)
If you don't want to delete your main account, create a test account first:
1. Sign out of your current account
2. Register a new test account
3. Log in with the test account

### 2. Test the Delete Flow
1. Navigate to Settings page
2. Scroll down to the "Security" section
3. Click the red "Delete Account" button
4. A dialog should appear asking for your password
5. Enter your password
6. Click "Delete Account" in the dialog

### 3. Expected Behavior
- ✓ Dialog opens when clicking "Delete Account"
- ✓ Password field is required
- ✓ If password is wrong, you get an error message
- ✓ If password is correct, account is deleted
- ✓ Success message appears
- ✓ You are automatically signed out
- ✓ You cannot log back in with the deleted account

## Troubleshooting

### Dialog doesn't open
- Check browser console (F12) for errors
- Make sure the Settings page loaded correctly
- Try refreshing the page

### "Function not found" error
- The database migration hasn't been applied yet
- Follow the instructions in `MANUAL_FIX_DELETE_ACCOUNT.md`
- Refresh your app after applying the migration

### "Incorrect password" error
- Make sure you're entering the correct password
- Check if caps lock is on
- Try resetting your password first if you're unsure

### Account not deleted
- Check browser console for errors
- Verify the database function was created (check Supabase Dashboard → Database → Functions)
- Make sure you're logged in

## Verify Deletion

After deleting an account, you can verify it worked by:
1. Trying to log in with the deleted credentials (should fail)
2. Checking the Supabase Dashboard → Authentication → Users (user should be gone)
3. Checking the database tables (user data should be removed)
