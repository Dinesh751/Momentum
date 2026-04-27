# Momentum — Mobile App

A gamified task management app where users earn points by completing prioritised tasks, maintain daily streaks, and unlock badges for consistent performance.

## Tech Stack

- **Expo** SDK 54 (managed workflow, new architecture enabled)
- **React Native** 0.81.5 with **React** 19
- **TypeScript** (strict mode)
- **NativeWind** v4 + **Tailwind CSS** v3 — utility-first styling
- **React Navigation** v7 — bottom tabs + native stack
- **Zustand** v5 — global state with TTL-based caching
- **React Hook Form** v7 — form handling
- **Axios** — HTTP client with JWT auth + auto token refresh
- **AsyncStorage** — token persistence

## Features

- **Task management** — add, complete, delete tasks with priority levels (High / Mid / Low / None)
- **Day navigation** — swipe between days, carry over incomplete tasks, move tasks to tomorrow
- **Recurring tasks** — schedule tasks on specific weekdays
- **Daily streak engine** — earn points to hit your daily threshold and maintain your streak
- **Streak stages** — Beginner → Building → Habit → Committed, each with a higher point threshold
- **Grace days** — one threshold-miss grace per week, two no-task grace days per week
- **Badges** — 12 badges across task milestones, streak milestones, and consistency goals
- **Stats** — lifetime overview, weekly/monthly points history, task breakdown by priority
- **Offline handling** — graceful degradation with cached data when the API is unreachable

## Project Structure

```
momentum-app/
├── app/                  # Screens organised by feature
│   ├── auth/             # Login, Register
│   ├── dashboard/        # Home / daily summary
│   ├── tasks/            # Task list, add/edit task, backlog
│   ├── streaks/          # Streak & consistency view
│   ├── badges/           # Badge showcase
│   └── stats/            # Points history and task stats
├── components/           # Shared UI components
├── hooks/                # Custom hooks (useAppForeground)
├── navigation/           # React Navigation stacks and tabs
├── services/             # Axios API layer (api.ts + feature slices)
├── store/                # Zustand stores with TTL caching
├── types/                # Shared TypeScript interfaces
├── constants/            # Points, thresholds, API base URL
└── utils/                # Date helpers
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device, or Android/iOS simulator

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run android    # Open in Android emulator
npm run ios        # Open in iOS simulator
```

### Environment

The app points to the production Railway backend by default:

```
https://momentum-production-0e7d.up.railway.app/api/v1
```

To use a local backend during development, update `constants/index.ts`:

```ts
export const API_BASE_URL = 'http://<your-local-ip>:8080/api/v1';
```

## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
# Preview APK (direct install on Android)
npx eas build --platform android --profile preview

# Production AAB (Google Play Store)
npx eas build --platform android --profile production
```

## Game Rules

| Priority | Points |
|----------|--------|
| High     | 10 pts |
| Mid      | 5 pts  |
| Low      | 2 pts  |
| None     | 0 pts  |

| Streak Stage | Unlocks at  | Daily threshold |
|--------------|-------------|-----------------|
| Beginner     | Day 1       | 10 pts          |
| Building     | 7-day streak| 12 pts          |
| Habit        | 14-day streak| 15 pts         |
| Committed    | 30-day streak| 20 pts         |

## Related

- [momentum-api](../momentum-api) — Spring Boot REST API backend
