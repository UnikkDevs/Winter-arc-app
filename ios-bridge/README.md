# Turning Winter Arc 2026 into a Working iOS App

You have two paths to run Winter Arc 2026 on your iPhone:

---

## Path 1: Instant iPhone PWA (No Mac or Xcode Required)

Winter Arc 2026 is fully built as an **iPhone-first Progressive Web App** with offline caching, local data persistence, and iOS safe-area support.

1. Open Safari on your iPhone.
2. Navigate to your public Shared App URL:
   `https://ais-pre-rsynf57mhsatt4s3zzvh5n-439442445610.asia-east1.run.app`
3. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
4. Scroll down and tap **"Add to Home Screen"**.
5. Tap **Add** in the top right.
6. Open **"Winter Arc"** from your iPhone home screen.

It will open in **standalone mode** (no URL bar, edge-to-edge dark display, full safe-area notch layout, and local persistence).

---

## Path 2: Native iOS App with Xcode & Apple HealthKit (SwiftUI)

If you want automatic syncing of **Steps, Sleep stages, and Workouts** from your Apple Watch via Apple HealthKit, follow these steps:

### Prerequisites
- A Mac with **Xcode 15+** installed.
- Free Apple Developer Account.

### Step-by-Step Xcode Setup

1. **Create an Xcode Project**:
   - Open Xcode -> **File > New > Project**.
   - Select **iOS > App** and click **Next**.
   - Product Name: `WinterArc2026`
   - Interface: **SwiftUI**
   - Language: **Swift**

2. **Add HealthKit Capabilities**:
   - Select your project in the navigator.
   - Go to **Signing & Capabilities**.
   - Click **+ Capability** and double-click **HealthKit**.
   - Check **Background Delivery** (optional for auto-sync).

3. **Configure Info.plist Privacy Descriptions**:
   - In `Info.plist` (or Target Build Settings > Info), add:
     - `Privacy - Health Share Usage Description`: `"Winter Arc tracks your daily steps and sleep duration to measure adherence to the 10 rules."`
     - `Privacy - Health Update Usage Description`: `"Winter Arc logs completed workouts to Apple Health."`

4. **Add the Swift Code**:
   - Replace your project's `ContentView.swift` and App file with the provided file:
     `/ios-bridge/SwiftUI_HealthKit_Wrapper.swift`.
   - Update `appURL` in `ContentView` to your hosted app URL or bundle `dist/` inside Xcode.

5. **Build and Run**:
   - Connect your iPhone via USB / Wi-Fi.
   - Select your iPhone as the build target in Xcode and press **Run (Cmd + R)**.
   - On your iPhone, accept the HealthKit permissions prompt for Steps & Sleep.

---

## Path 3: Capacitor CLI (Automated Web-to-Native)

You can also wrap this Vite project with Capacitor:

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capawesome/capacitor-health-connect

# 2. Initialize Capacitor
npx cap init "Winter Arc 2026" "com.winterarc.app" --web-dir "dist"

# 3. Build Web Bundle
npm run build

# 4. Add iOS Platform
npx cap add ios

# 5. Open Xcode
npx cap open ios
```
In Xcode, sign with your Apple ID and hit **Run** on your physical iPhone.
