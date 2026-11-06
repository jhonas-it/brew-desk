# Brew Desk — reorganized source

This is an **offline copy** of your uploaded project. Your original repository is untouched.

## Key structure
- `frontend/src/app/`: route tree and protected auth gate
- `frontend/src/layouts/`: shared layout and your preferred POS sidebar
- `frontend/src/features/pos/`: POS UI, cart, checkout, and transaction-draft services
- `frontend/src/features/auth/`: login screens and login service
- `frontend/src/features/inventory/`: inventory UI
- `frontend/src/features/staff/`: staff UI, dialogs, and staff service
- `frontend/src/components/`: actually shared UI primitives
- `frontend/src/lib/`: utilities and separate POS Firestore initialization
- `frontend/lib/firebase.js`: existing Firebase Auth + Realtime Database initialization (left in place)

The unused, duplicate `frontend/src/components/Sidebar.jsx` and `Sidebar.css` were removed; your preferred sidebar remains in `src/layouts/Sidebar.jsx`.

## Important
- The uploaded ZIP included `.git`, `node_modules`, and possibly local secrets. Those were intentionally excluded from this output.
- Existing Firebase configurations are intentionally **not unified** because the project currently uses both Firestore and Realtime Database. Review that separately before merging databases.
- Before replacing your working copy, create a Git branch or backup; test login, POS, inventory, staff actions, then logout.
- From `frontend/` run `npm ci` and `npm run build` (network access may be needed).
- Do not overwrite your existing local `.env` file with a downloaded copy.
