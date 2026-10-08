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

Forgotten passwords can't be reset by email (accounts have no real email); reset them in the
Firebase console → Authentication.

## Local emulators and rule tests

Requires Java 11+ for the Firestore emulator.

```bash
# Run the app against local emulators: set NUXT_PUBLIC_FIREBASE_USE_EMULATORS=true in .env
npm run emulators

# Security-rule tests
npx firebase-tools emulators:exec --only firestore "npm run test:rules"
```

## Deploying (free: Firebase Spark plan)

The app is a fully static site: `nuxt generate` prerenders the marketing page and serves every
other route from the SPA fallback `200.html`. There are no server routes and no Cloud Functions,
so everything fits the free Spark plan (Hosting, Auth email/password and Firestore free quotas).

```bash
npm run deploy   # nuxt generate + deploy hosting, rules and indexes
```

`.env` is read at generate time, so rebuild after changing it.
