# Stallside Owner (store shell)

Native Android/iOS projects wrap the hosted Next.js owner app for App Store / Play listing.

Customers still use the phone browser via QR - this shell is owner-only.

## Prerequisites

- `npm run dev` (or a deployed URL) running
- Xcode (iOS) and/or Android Studio (Android)
- For a physical device against localhost, use your machine LAN IP in `CAPACITOR_SERVER_URL`

## Commands

```bash
CAPACITOR_SERVER_URL=http://127.0.0.1:3000 npx cap sync
npm run cap:ios
```

Production:

```bash
CAPACITOR_SERVER_URL=https://stallside.app npx cap sync
```

## Store listing notes

- Bundle ID: `com.myfarmstand.owner` (unchanged for now)
- App display name: Stallside
- Audience: farm stand owners
