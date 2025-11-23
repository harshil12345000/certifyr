# Delete Account Edge Function

This edge function handles secure account deletion with proper authentication and data cleanup.

## Features
- Validates user authentication via JWT
- Uses service role key for admin operations
- Cleans up user data from related tables
- Deletes user from Supabase Auth
- Proper error handling and CORS support

## Deployment

```bash
supabase functions deploy delete-account
```

## Usage

Called automatically from the Settings page when a user confirms account deletion.

## Environment Variables Required
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (admin)

These are automatically provided by Supabase when deploying edge functions.
