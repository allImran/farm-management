# FarmXYZ — Broiler Farm Management

Nuxt 4 + Firebase (Auth + Firestore) app for managing broiler farms: farms, batches, feed,
medicine, mortality, weight, expenses, sales and contacts. Bangla by default, English available.

## How access works

- Anyone can sign up with **name + mobile number + password** (no SMS verification).
- Signed-in users can **read** their own data. **Writing** needs an active subscription.
- To subscribe, a user pays by bKash, then submits the **last 4 digits** of the number they paid
  from. The admin is notified on Slack (if configured) and approves or rejects the request in
  `/admin`.
- When approving, the admin grants **1 month by default**. They can also pick any number of months
  (which extends an active subscription from its current end date), **free forever**, or a
  **custom date range**, and can revoke access later from the Users tab.
- **Forgot password**: there is no SMS or real email, so a user enters their number on
  `/forgot-password` and the request shows up in **Admin → Password resets**. The admin calls the
  number to confirm it's the owner, then approves: the password becomes a random one-time password
  shown only to the admin (who reads it to the owner on that call), the account is logged out
  everywhere, and after logging in with it the user is kept on the account page until they choose
  a new password. Admin accounts can't be reset this way, and a number can be re-requested at
  most every 15 minutes. Anyone can request a reset for any number, so the admin's check is
  what keeps accounts safe; never approve without it.
- All of this is enforced by `firestore.rules`; the UI checks only make the experience smoother.

## Setup

1. Create a Firebase project, add a **Web app**, and enable:
   - **Authentication → Email/Password** (phone numbers are stored as `<phone>@phone.broilerhq.app`).
   - **Firestore**.
2. Copy `.env.example` to `.env` and fill in the web app config.
   `NUXT_PUBLIC_SLACK_WEBHOOK_URL` is optional (a Slack incoming-webhook URL). Because the site is
   static, this URL ends up in the public JavaScript; post to a dedicated channel and regenerate
   the URL if it's ever abused.
3. Deploy the rules and indexes (the project is already set in `.firebaserc`):
   ```bash
   npx firebase-tools login
   npm run deploy:firestore
   ```
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```
5. **Make yourself admin**: sign up in the app, copy your user UID from Firebase console →
   Authentication, then in Firestore create a document `admins/<your-uid>` (any fields, or none).
   Reload — the **Admin** item appears in the sidebar.
6. In **Admin → Plan**, set the monthly price and the bKash number users should pay to.

7. Deploy the Cloud Function that approves password resets (needs the **Blaze** plan, see below):
   ```bash
   npm run deploy:functions
   ```

## Local emulators and rule tests

Requires Java 11+ for the Firestore emulator. `npm run emulators` also builds and serves the
Cloud Functions in `functions/`.

```bash
# Run the app against local emulators: set NUXT_PUBLIC_FIREBASE_USE_EMULATORS=true in .env
npm run emulators

# Security-rule tests
npx firebase-tools emulators:exec --only firestore "npm run test:rules"
```

## Deploying (Firebase Blaze plan)

The app is a static site: `nuxt generate` prerenders the marketing page and serves every other
route from the SPA fallback `200.html`. Its only backend is one Cloud Function in `functions/`
(`approvePasswordReset`), because only the Admin SDK can set another user's password. Cloud
Functions need the pay-as-you-go **Blaze** plan; at this app's scale usage stays inside the free
tier, but a billing account must be attached.

```bash
npm run deploy   # nuxt generate + deploy hosting, rules, indexes and functions
```

`.env` is read at generate time, so rebuild after changing it.
