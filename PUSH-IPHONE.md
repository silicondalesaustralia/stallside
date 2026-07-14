# Stallside - iPhone push (Capacitor) without Firebase

Capacitor on iOS gives an **APNs** device token. We send iOS pushes via **Apple Push Notification service** directly. Firebase is only needed later for Android.

Bundle ID: `com.myfarmstand.owner`

---

## 1. Apple Developer (one-time)

1. [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → App ID `com.myfarmstand.owner` → enable **Push Notifications**
3. **Keys** → **+** → name `Stallside APNs` → enable **Apple Push Notifications service (APNs)** → Continue → Register
4. **Download the `.p8` once** (you can’t download it again). Note **Key ID** and your **Team ID** (top-right membership).

---

## 2. Vercel / `.env` env vars

```bash
APNS_KEY_ID=XXXXXXXXXX
APNS_TEAM_ID=XXXXXXXXXX
APNS_BUNDLE_ID=com.myfarmstand.owner
# Paste the .p8 PEM contents; use \n for newlines in Vercel UI, or a multiline secret
APNS_KEY_P8="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# Xcode → physical device (debug) uses sandbox:
APNS_USE_SANDBOX=true
```

For TestFlight / App Store later: set `APNS_USE_SANDBOX=false` and change `App.entitlements` `aps-environment` to `production`.

Redeploy Vercel after saving.

---

## 3. Xcode on this Mac

```bash
cd /Users/jonosmmachine/Documents/Cursor/MyFarmStand
CAPACITOR_SERVER_URL=https://stallside.app npx cap sync ios
npm run cap:ios
```

In Xcode:

1. Select **App** target → **Signing & Capabilities**
2. Team = your Apple Developer team
3. Confirm **Push Notifications** capability is present (entitlements file already wired)
4. Plug in iPhone → select it as run destination (**not** Simulator)
5. Run (▶)

---

## 4. Register the token

1. Sign in with magic link (Resend)
2. Stay on `/dashboard` - app requests notification permission → **Allow**
3. Safari/Xcode console should show `[Stallside] push token registered with server`
4. In Neon / Prisma Studio, `PushDevice` should have an `ios` row for your owner

---

## 5. Trigger a ding

From another phone/browser: complete a **cash sale** on your stand QR, or drop inventory below threshold.

Expect: banner + sound on the iPhone (app backgrounded is the clearest test).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `registrationError` | Paid Apple Developer account? Push enabled on App ID? Physical device? |
| Token registers, no ding | `APNS_*` on Vercel? Sandbox vs production mismatch? Redeployed? |
| `BadDeviceToken` | Debug install needs `APNS_USE_SANDBOX=true` |
| No permission prompt | Delete app, reinstall, or Settings → Stallside → Notifications |

Email alerts still work independently of push.
