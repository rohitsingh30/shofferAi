---
name: mobile
description: Launch the ShofferAI mobile app on iOS Simulator, Android Emulator, or Web. Use this when asked to start mobile, run the app, test on phone, launch simulator, or open Expo.
---

Launch the Expo mobile app for ShofferAI. Asks the user which platform to test on, starts the Expo dev server, and opens the app on the chosen platform.

## Instructions

### Step 1: Ask platform

Ask the user which platform to launch on:

- **iOS Simulator** — Opens in Xcode iOS Simulator
- **Android Emulator** — Opens in Android Studio emulator
- **Web** — Opens in the browser at localhost:8081

Use the `ask_user` tool with these three choices.

### Step 2: Check for existing Expo process

```bash
lsof -i :8081 2>/dev/null | grep LISTEN | head -3 || echo "PORT_FREE"
```

If Expo is already running on port 8081, skip to Step 4 (launch platform). If not, continue to Step 3.

### Step 3: Start Expo dev server

Start the Expo dev server in async mode so we can interact with it:

```bash
cd /Users/rohit/shofferAi/apps/mobile && npx expo start
```

Run this with `mode="async"`. Wait ~10 seconds for the server to start. Look for the Metro bundler output showing the QR code and port info.

If you see dependency warnings, ignore them — they are non-breaking.

### Step 4: Launch on chosen platform

**iOS Simulator — IMPORTANT: always pre-launch Simulator before pressing `i`.**

Expo uses `osascript` to check if Simulator is running, which fails with a macOS Automation permission error (`Not authorized to send Apple events to System Events. (-1743)`). This crashes the Expo process. To avoid this:

1. Run `open -a Simulator` first (wait ~5 seconds for it to boot)
2. Then send `i` to the Expo console

```bash
# Pre-launch Simulator (required for iOS)
open -a Simulator
sleep 5
```

**All platforms — send the appropriate key to the Expo process:**

| Platform | Key | Pre-step |
|----------|-----|----------|
| iOS Simulator | `i` | **Must** run `open -a Simulator` first (see above) |
| Android Emulator | `a` | None (or start emulator manually if not found) |
| Web | `w` | None |

Use `write_bash` to send the key (`i`, `a`, or `w`) to the Expo shell session.

Wait 15–30 seconds for the platform to boot and the app to load.

### Step 5: Handle common issues

**iOS Simulator still won't open after pre-launch:**
- Verify Simulator is running: `pgrep -x Simulator`
- If not, open it again: `open -a Simulator`
- Then press `i` again in the Expo console

**Android Emulator not found:**
- Ensure Android Studio is installed and an AVD is configured
- Run `emulator -list-avds` to check available devices
- Start the emulator manually: `emulator -avd <avd_name>`
- Then press `a` again in the Expo console

**Port 8081 already in use:**
- Kill the existing process: find the PID from `lsof -i :8081` and kill it
- Restart Expo

**Build errors:**
- Run `cd apps/mobile && npx expo start --clear` to clear the Metro cache

### Step 6: Report status

```
ShofferAI Mobile
──────────────────────────────────────
Platform:    iOS Simulator | Android Emulator | Web
Expo:        ✓ Running on :8081
Metro:       exp://192.168.x.x:8081
App:         ✓ Loaded | ✗ Error (details)
──────────────────────────────────────
```

Also remind the user:
- **Scan QR code** with Expo Go app on a physical device
- **Shake device** to open Expo dev menu
- Press `r` in the terminal to reload the app
- Press `j` to open the debugger

## Notes

- The mobile app is at `apps/mobile/` — an Expo Router app with React Native
- App config: `apps/mobile/app.json` (slug: `shofferai`, scheme: `shofferai`)
- The app connects to **production Cloud Run** (`https://shofferai-27188185100.asia-south1.run.app`) for API calls, not localhost
- Dev login: `demo@shofferai.com` / `demo1234` (via the "Dev Login" button)
- Google OAuth needs `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `apps/mobile/.env`
