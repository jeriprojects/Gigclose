# GigsClose

GigsClose is a Vite + React + Supabase app for the public website and authenticated dashboards.

## Web    

Run the website locally:
```bash
npm install
npm run dev
```

Build the website:

```bash
npm run build
```

## Mobile App

The mobile app is a Capacitor native wrapper around the live website at `https://gigsclose.vercel.app/`.

This setup is intentional:

- the app uses the exact same UI as the website
- the app uses the exact same Supabase backend because it loads the same deployed app
- any UI or functionality update deployed to the website is immediately reflected in the mobile app without rebuilding screens twice

Native projects live in:

- `android/`
- `ios/`

### Mobile commands

```bash
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
npm run mobile:run:android
```

### Config

Capacitor is configured in [capacitor.config.ts](/workspaces/gig-flow/capacitor.config.ts).

Important details:

- app id: `com.gigsclose.app`
- live app URL: `https://gigsclose.vercel.app/`
- Supabase auth and data stay shared with the website because the app loads the same deployed frontend

### Native permissions

Location permissions were added for parity with the web app's nearby job features:

- Android: [AndroidManifest.xml](/workspaces/gig-flow/android/app/src/main/AndroidManifest.xml)
- iOS: [Info.plist](/workspaces/gig-flow/ios/App/App/Info.plist)
