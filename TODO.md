# TODO: Fix Google OAuth Deployment and Add UI Clarification

## UI Update for Google Login (Customer Only Tag)
- [x] Edit `frontend/src/components/GoogleRoleSelection.js`:
  - Add a subtitle "For customers only" below the "Sign in with Google" button using a <p> tag with appropriate styling (text-xs, gray-500, centered).
  - Ensure no changes to the redirect logic or other functionality.

## Deployment Configuration for Google OAuth
- [ ] Set Environment Variables in Vercel (for Frontend):
  - Go to Vercel Dashboard > Your Project > Settings > Environment Variables.
  - Add: REACT_APP_BACKEND_URL = https://niche-e-commerce-platform-for-handmade-uncq.onrender.com
  - Add/Update: REACT_APP_API_URL = https://niche-e-commerce-platform-for-handmade-uncq.onrender.com
  - Redeploy the frontend.
- [ ] Set Environment Variables in Render (for Backend):
  - Go to Render Dashboard > Your Service > Environment.
  - Add/Update: BACKEND_URL = https://niche-e-commerce-platform-for-handmade-uncq.onrender.com
  - Add/Update: FRONTEND_URL = https://niche-e-commerce-platform-for-handm.vercel.app
  - Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
  - Redeploy the backend.
- [ ] Update Google Cloud Console:
  - Go to Google Cloud Console > APIs & Services > Credentials > Your OAuth 2.0 Client IDs > Edit the web client.
  - Under Authorized redirect URIs, add: https://niche-e-commerce-platform-for-handmade-uncq.onrender.com/api/auth/google/callback
  - Save changes (no redeploy needed).
- [ ] Test the Full Flow:
  - Launch browser at https://niche-e-commerce-platform-for-handm.vercel.app/login.
  - Click "Sign in with Google" (now with customer tag).
  - Verify: Redirect to backend /api/auth/google -> Google auth page -> Callback -> Back to frontend /login with ?token=...&user=... -> localStorage set -> Navigate to dashboard (for customer role).
  - Check for no 404 errors, correct redirects, and user stored as customer.

## Notes
- No code changes beyond the UI tag; all fixes are configuration-based.
- After completing UI edit, mark as done and proceed to deployment steps.
- If issues persist after env vars, check Render logs for errors and Google Console for URI mismatches.
