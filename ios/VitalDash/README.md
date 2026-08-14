# VitalDash (iOS)

A native SwiftUI client for the VitalDash web app — same backend
(`https://vitaldash.morganserver.com`), same account, same data. This is
not a separate product; it's another way to hit the same API the web
dashboard already uses.

## Why the login screen is different from everything else

Native Face ID (`ASAuthorizationPlatformPublicKeyCredentialProvider`)
needs an Associated Domains entitlement, which needs a paid Apple
Developer Program membership. Until that's set up, `LoginView` loads the
existing, already-working `/login` page in a `WKWebView` — WebKit's
built-in WebAuthn support does Face ID the same way Safari does, no
special entitlement required. Once a session cookie comes back, it's
copied into `URLSession`'s shared cookie jar and every native screen after
that talks to the API directly, no web view involved.

When there's a paid account: swap `LoginWebView`/`LoginView` for a native
`ASAuthorizationController` flow. Nothing else in the app needs to change
— the session cookie contract stays identical either way.

## What's here (v1 — "core")

- Face ID sign-in (via the web view, see above)
- Dashboard: weight / blood pressure / steps cards, weight trend chart
- Log a weight entry, log a blood pressure reading
- Sign out

Not yet ported: entry history, edit/delete, account settings, invites.
Those still only exist in the web app — open it in Safari for now.

## Prerequisites

1. **Full Xcode**, not just the Command Line Tools:
   ```bash
   xcode-select -p
   ```
   If that prints `/Library/Developer/CommandLineTools` instead of
   `/Applications/Xcode.app/Contents/Developer`, switch it:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   ```
2. **[XcodeGen](https://github.com/yonaskolb/XcodeGen)** — this repo
   checks in `project.yml`, not the generated `.xcodeproj`, so everyone
   regenerates it locally instead of fighting merge conflicts in Xcode's
   project file format.
   ```bash
   brew install xcodegen
   ```

## Building

```bash
cd ios/VitalDash
xcodegen generate
open VitalDash.xcodeproj
```

Then Run in Xcode (⌘R) targeting an iOS Simulator. Sign in with the same
Face ID passkey you use on the web app — same account, same domain.

Re-run `xcodegen generate` any time `project.yml` changes, or after
pulling changes that touched it.

## Project layout

```
VitalDash/
  App/            App entry point, root view (login vs. dashboard)
  Auth/           SessionStore, the login web view + screen
  Networking/     APIClient (the only thing that calls the network) + models
  Dashboard/      Stat cards, weight chart, chart math (mirrors chart-math.ts)
  Logging/        Log weight / log BP forms
  DesignSystem/   Color tokens mirrored from the web app's globals.css
```
