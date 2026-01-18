# SWAFarms Technical Documentation

> Agricultural PWA for Rural India - Complete Technical Overview

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Authentication System](#authentication-system)
5. [State Management](#state-management)
6. [Routing Structure](#routing-structure)
7. [Internationalization](#internationalization)
8. [Key Features](#key-features)
9. [File Structure](#file-structure)

---

## Executive Summary

SWAFarms is a Progressive Web Application (PWA) designed for farmers in rural India. It provides plot management, crop planning with AI recommendations, weather integration, and offline-first capabilities. The app supports 5 Indian languages and is optimized for outdoor readability with large touch targets.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser/PWA)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   React 18      │  │   Vite Build    │  │   TypeScript    │              │
│  │   Components    │  │   System        │  │   Type Safety   │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│  ┌────────▼────────────────────▼────────────────────▼────────┐              │
│  │                        App Shell                           │              │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │              │
│  │  │ React Router │  │   Zustand    │  │ React Query  │     │              │
│  │  │   Routing    │  │    State     │  │ Server State │     │              │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │              │
│  └───────────────────────────────────────────────────────────┘              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                      UI Layer                                │            │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │            │
│  │  │ Tailwind  │  │  shadcn/  │  │  Framer   │  │  Lucide   │ │            │
│  │  │    CSS    │  │    ui     │  │  Motion   │  │   Icons   │ │            │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                    Feature Modules                           │            │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐ │            │
│  │  │   Auth    │  │   Plots   │  │ Planning  │  │ Diagnosis │ │            │
│  │  │  Module   │  │  Module   │  │  Module   │  │  Module   │ │            │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                   Offline Storage                            │            │
│  │  ┌───────────────────────┐  ┌───────────────────────┐       │            │
│  │  │     LocalForage      │  │     localStorage      │       │            │
│  │  │   (IndexedDB/WebSQL) │  │   (Auth Persistence)  │       │            │
│  │  └───────────────────────┘  └───────────────────────┘       │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────┐      ┌─────────────────────────┐               │
│  │        Auth0            │      │      Map Services       │               │
│  │  ┌───────────────────┐  │      │  ┌───────────────────┐  │               │
│  │  │ Universal Login   │  │      │  │     Leaflet       │  │               │
│  │  │ Token Management  │  │      │  │   OpenStreetMap   │  │               │
│  │  │ Session Handling  │  │      │  └───────────────────┘  │               │
│  │  └───────────────────┘  │      └─────────────────────────┘               │
│  └─────────────────────────┘                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI component library |
| TypeScript | - | Type-safe JavaScript |
| Vite | - | Build tool & dev server |

### Styling & UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | - | Utility-first CSS framework |
| tailwindcss-animate | 1.0.7 | Animation utilities |
| shadcn/ui | - | Radix UI-based component library |
| Framer Motion | 12.26.1 | Animation library |
| Lucide React | 0.462.0 | Icon library |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.10 | Client state management with persistence |
| TanStack React Query | 5.83.0 | Server state & caching |

### Authentication

| Technology | Version | Purpose |
|------------|---------|---------|
| @auth0/auth0-react | 2.11.0 | Authentication provider |

### Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| React Router DOM | 6.30.1 | Client-side routing |

### Internationalization

| Technology | Version | Purpose |
|------------|---------|---------|
| i18next | 25.7.4 | i18n framework |
| react-i18next | 16.5.2 | React bindings for i18next |
| i18next-browser-languagedetector | 8.2.0 | Auto language detection |

### Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| React Hook Form | 7.61.1 | Form state management |
| Zod | 3.25.76 | Schema validation |
| @hookform/resolvers | 3.10.0 | Zod integration for RHF |

### UI Components (Radix UI Primitives)

| Component | Version |
|-----------|---------|
| Accordion | 1.2.11 |
| Alert Dialog | 1.1.14 |
| Avatar | 1.1.10 |
| Checkbox | 1.3.2 |
| Dialog | 1.1.14 |
| Dropdown Menu | 2.1.15 |
| Popover | 1.1.14 |
| Select | 2.2.5 |
| Slider | 1.3.5 |
| Switch | 1.2.5 |
| Tabs | 1.1.12 |
| Toast | 1.2.14 |
| Tooltip | 1.2.7 |

### Maps & Location

| Technology | Version | Purpose |
|------------|---------|---------|
| Leaflet | 1.9.4 | Interactive maps |
| @types/leaflet | 1.9.21 | TypeScript definitions |

### Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.15.4 | Charts and graphs |

### Offline & Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| LocalForage | 1.10.0 | IndexedDB/WebSQL wrapper |
| vite-plugin-pwa | 1.2.0 | PWA support |

### HTTP & Data Fetching

| Technology | Version | Purpose |
|------------|---------|---------|
| Axios | 1.13.2 | HTTP client |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| date-fns | 3.6.0 | Date manipulation |
| clsx | 2.1.1 | Conditional classnames |
| tailwind-merge | 2.6.0 | Merge Tailwind classes |
| class-variance-authority | 0.7.1 | Component variants |

### Additional UI Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| Sonner | 1.7.4 | Toast notifications |
| Vaul | 0.9.9 | Drawer component |
| CMDK | 1.1.1 | Command palette |
| Embla Carousel | 8.6.0 | Carousel component |
| React Day Picker | 8.10.1 | Date picker |
| React Resizable Panels | 2.1.9 | Resizable layouts |
| Input OTP | 1.4.2 | OTP input component |

---

## Authentication System

### Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login.tsx  │────▶│    Auth0     │────▶│  Auth0Sync   │
│              │     │   Provider   │     │  Component   │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │   Zustand    │
                                          │  Auth Store  │
                                          │ (Persisted)  │
                                          └──────┬───────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────────┐
                     │                            │                            │
                     ▼                            ▼                            ▼
              ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
              │  AuthGuard   │            │   Protected  │            │   User       │
              │  Component   │            │    Routes    │            │   Context    │
              └──────────────┘            └──────────────┘            └──────────────┘
```

### Key Components

1. **Auth0Provider** (`src/App.tsx`)
   - Wraps entire application
   - Configures Auth0 domain and client ID
   - Handles redirect callbacks

2. **Auth0Sync** (`src/components/Auth0Sync.tsx`)
   - Syncs Auth0 session to local Zustand store
   - Fetches access tokens silently
   - Handles logout synchronization

3. **Auth Store** (`src/stores/auth.ts`)
   - Zustand store with localStorage persistence
   - Key: `swafarms-auth`
   - Stores: user, token, isAuthenticated, hasCompletedOnboarding

4. **AuthGuard** (`src/components/AuthGuard.tsx`)
   - Protects routes requiring authentication
   - Redirects to login if not authenticated

### User Object Shape

```typescript
interface User {
  id: string;      // Auth0 sub claim
  phone: string;   // Auth0 phone_number (optional)
  name?: string;   // Auth0 name or nickname
}
```

---

## State Management

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      State Management                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐      ┌─────────────────────┐       │
│  │      Zustand        │      │    React Query      │       │
│  │   (Client State)    │      │   (Server State)    │       │
│  ├─────────────────────┤      ├─────────────────────┤       │
│  │ • Auth state        │      │ • API responses     │       │
│  │ • UI preferences    │      │ • Caching           │       │
│  │ • Offline data      │      │ • Background sync   │       │
│  │ • Connectivity      │      │ • Optimistic updates│       │
│  └─────────────────────┘      └─────────────────────┘       │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────────────────────────────────────┐        │
│  │              localStorage / IndexedDB            │        │
│  │              (Persistence Layer)                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Stores

| Store | File | Purpose |
|-------|------|---------|
| Auth Store | `src/stores/auth.ts` | User authentication state |
| Connectivity Store | `src/stores/connectivity.ts` | Online/offline status |

---

## Routing Structure

### Route Hierarchy

```
/
├── / (Dashboard - Protected)
├── /login (Public)
├── /onboarding (Public)
├── /planning (Protected)
├── /diagnosis (Protected)
├── /media (Protected)
├── /marketplace (Protected)
├── /settings (Protected)
├── /plots/new (Protected - Full Screen)
├── /plots/:id (Protected)
├── /plots/:id/crop (Protected - Full Screen)
├── /plan-crop (Protected - Full Screen)
└── * (404 Not Found)
```

### Protection Levels

| Level | Description |
|-------|-------------|
| Public | Accessible without authentication |
| Protected | Requires authentication via AuthGuard |
| Full Screen | Protected routes without AppLayout wrapper |

---

## Internationalization

### Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| hi | Hindi | हिंदी |
| ta | Tamil | தமிழ் |
| te | Telugu | తెలుగు |
| kn | Kannada | ಕನ್ನಡ |

### Configuration

- Detection order: localStorage → navigator
- Fallback language: English (en)
- Translation files: `src/i18n/locales/*.json`

---

## Key Features

### 1. Plot Management
- Create and manage agricultural plots
- GPS-based location tracking
- Soil testing parameters
- Equipment and organic inputs tracking

### 2. Crop Planning (AI-Powered)
- Season-based recommendations
- Suitability scoring algorithm
- Planting date suggestions
- Weather integration

### 3. Diagnosis
- Crop health analysis
- Context-aware recommendations

### 4. Offline Support
- LocalForage for data persistence
- Connectivity status monitoring
- Sync status indicators

### 5. Voice Input
- Audio help buttons
- Voice-enabled crop selection

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── create-plot/           # Plot creation components
│   ├── dashboard/             # Dashboard widgets
│   ├── diagnosis/             # Diagnosis components
│   ├── planning/              # Planning components
│   ├── plots/                 # Plot detail components
│   ├── AppLayout.tsx          # Main layout wrapper
│   ├── Auth0Sync.tsx          # Auth synchronization
│   ├── AuthGuard.tsx          # Route protection
│   ├── BottomNavigation.tsx   # Mobile navigation
│   └── ...
├── hooks/
│   ├── use-api.ts             # API hook
│   ├── use-mobile.tsx         # Mobile detection
│   └── use-toast.ts           # Toast notifications
├── i18n/
│   ├── index.ts               # i18n configuration
│   └── locales/               # Translation files
├── lib/
│   ├── crop-recommendations.ts # AI scoring logic
│   ├── offline-storage.ts     # Offline data handling
│   └── utils.ts               # Utility functions
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── PlanCrop.tsx
│   └── ...
├── services/
│   └── api.ts                 # API service layer
├── stores/
│   ├── auth.ts                # Auth state
│   └── connectivity.ts        # Connectivity state
├── types/
│   └── api.ts                 # TypeScript types
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

---

## Design System

### Color Tokens (HSL)
- Primary: Green agricultural theme
- High contrast for outdoor readability
- Dark mode support

### Typography
- Font: Inter (400-800 weights)
- Large, readable sizes for rural users

### Touch Targets
- Minimum 44px touch areas
- Large buttons and interactive elements

---

## Development

### Prerequisites
- Node.js (with npm)
- Git

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

---

## Future Considerations

1. **Backend Integration**
   - Supabase/Lovable Cloud for database
   - Edge functions for server-side logic

2. **AI Enhancement**
   - Server-side LLM for crop recommendations
   - Image-based disease detection

3. **PWA Features**
   - Push notifications
   - Background sync
   - App installation prompts

---

*Document Version: 1.0*
*Generated: January 2025*
*Project: SWAFarms - Agricultural PWA*
