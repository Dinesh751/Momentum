# Momentum App — Frontend Context

## What is This
React Native mobile frontend for Momentum — a gamified task management app where users
earn points by completing prioritised tasks, maintain daily streaks, and unlock badges.
See `../CLAUDE.md` for the full product context, game rules, and badge catalogue.

## Tech Stack
- **Expo** (SDK 54, new architecture enabled) — managed workflow, portrait orientation
- **React Native** 0.81.5 with **React** 19
- **TypeScript** (strict mode)
- **NativeWind** v4 + **Tailwind CSS** v3 — utility-first styling in JSX
- **React Navigation** v7 — bottom tabs + native stack
- **Zustand** v5 — global state management
- **React Hook Form** v7 — form handling
- **Axios** — HTTP client for the REST API
- **AsyncStorage** — local persistence (tokens, cached state)

## Project Structure (to be built)
```
momentum-app/
├── app/                  # Screens organised by feature
│   ├── auth/             # Login, Register
│   ├── dashboard/        # Home / daily summary
│   ├── tasks/            # Task list, add/edit task
│   ├── streaks/          # Streak & consistency view
│   └── badges/           # Badge showcase
├── components/           # Shared UI components
├── hooks/                # Custom hooks (useAuth, useTasks, etc.)
├── store/                # Zustand stores
├── services/             # Axios API calls (api.ts + feature slices)
├── types/                # Shared TypeScript interfaces
├── constants/            # Points, thresholds, badge definitions
└── utils/                # Helpers (date, formatting, etc.)
```

## API Integration
- Backend: `momentum-api` Spring Boot service (see `../momentum-api/CLAUDE.md`)
- Base URL convention: `http://localhost:8080/api/v1` (dev)
- Auth: JWT in `Authorization: Bearer <token>` header; store access + refresh tokens in AsyncStorage
- Response shape: `{ success: boolean, message: string, data: T }`

## Developer Notes
- Developer knows React but is **new to React Native and Expo** — explain RN-specific
  concepts clearly (e.g. how StyleSheet differs from CSS, metro bundler, native modules)
- Use NativeWind classes as the first styling option; fall back to StyleSheet only when
  NativeWind cannot handle the case
- Keep screens thin — business logic lives in hooks/store, not components
- No shortcuts — build it properly from the start
- Follow industry best practices at all times

## Running the App
```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run ios        # Open in iOS simulator
npm run android    # Open in Android emulator
npm run web        # Open in browser (limited RN support)
```
