# Restrict Google Sign-In to Customers Only

## Tasks
- [x] Update Backend/routes/authRoutes.js: Modify GoogleStrategy to always set role/userType to 'customer', remove state handling, allow email takeover for existing users.
- [x] Update Backend/routes/authRoutes.js: Modify /google route to remove state validation and passing.
- [x] Update Backend/routes/authRoutes.js: Modify /google/callback to remove state extraction, always ensure customer role, update existing artisans to customer.
- [x] Update frontend/src/components/GoogleRoleSelection.js: Remove 'provider' option, simplify to always customer-only, remove role selection UI.
- [ ] Test Google login for new users (creates as customer).
- [ ] Test Google login for existing artisan emails (updates to customer).
- [ ] Test artisan registration/login (email/password only, no Google).
- [ ] Verify existing flows (email login, OTP, etc.) remain unaffected.
