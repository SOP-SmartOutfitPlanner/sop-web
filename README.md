<div align="center">

# 👔 SOP - Smart Oufit Planner

### _Your AI-Powered Digital Wardrobe_

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**Stop staring at your closet. Start wearing confidence.**

[🚀 Getting Started](#-getting-started) • [✨ Features](#-features) • [🏗️ Architecture](#-project-structure) • [📖 Documentation](#-api-integration)

</div>

---

## 🎯 What is SOP?

Ever stood in front of your wardrobe for 20 minutes, only to wear the same outfit you wore last week? **We've all been there.**

**SOP (Smart Oufit Planner)** is your personal AI stylist that lives in your browser. Snap a photo of your clothes, and our AI analyzes colors, patterns, and materials. Get outfit suggestions based on today's weather. Plan your looks for the week. Share your style with a community of fashion enthusiasts.

> 🧠 **The magic?** Our AI doesn't just see "a blue shirt" — it understands _navy cotton oxford with subtle texture, perfect for smart-casual occasions in mild weather_.

---

## ✨ Features

### 🚀 For Fashion Lovers

| Feature                          | What it does                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------- |
| 📸 **AI Wardrobe Scan**          | Upload photos → AI extracts colors, materials, patterns, and weather suitability |
| 🔍 **Smart Search**              | Fuzzy search that understands "that blue-ish formal thing"                       |
| 👗 **Outfit Builder**            | Drag, drop, and create stunning outfit combinations                              |
| 📅 **Calendar Planning**         | Schedule outfits for the week — never repeat accidentally                        |
| 🌤️ **Weather-Aware Suggestions** | "It's 28°C and humid? Here's what to wear."                                      |
| 📦 **Collections**               | Organize by vibe: _Work_, _Weekend_, _Date Night_, _Vacation_                    |
| 👥 **Community**                 | Share looks, follow stylists, get inspired                                       |
| 🔔 **Push Notifications**        | Reminders and updates, right when you need them                                  |

### 🛠️ For Admins

Full control panel with user management, category configuration, AI settings, analytics dashboards, and system reports. Everything you need to keep the platform running smoothly.

---

## 🧪 Tech Stack

<table>
<tr>
<td width="50%">

### ⚡ Core

```
Next.js 15.5.3    → App Router + Turbopack
React 19.1.0      → Latest concurrent features
TypeScript 5      → Strict mode, no excuses
```

### 🎨 UI/UX

```
Tailwind CSS 4    → Utility-first styling
shadcn/ui         → Beautiful Radix primitives
Framer Motion 12  → Buttery animations
GSAP 3            → Pro-level motion
Lenis             → Smooth scroll that feels right
Glass Morphism    → Custom frosted-glass design system
```

</td>
<td width="50%">

### 📊 State & Data

```
Zustand 5         → Simple, powerful state
TanStack Query 5  → Server state mastery
Axios             → HTTP with auto token refresh
Fuse.js           → Lightning-fast fuzzy search
```

### 🔐 Auth & Real-time

```
JWT               → Auto-refresh tokens
Google OAuth      → One-click login
Firebase FCM      → Push notifications
SignalR           → Real-time updates
```

### 📝 Forms

```
React Hook Form 7 → Performance-first forms
Zod 4             → Type-safe validation
```

</td>
</tr>
</table>

### 🧩 The Full Arsenal

<details>
<summary><b>Click to see all dependencies</b></summary>

**UI Components:** Radix UI (Dialog, Dropdown, Popover, Tabs, Select, etc.), Ant Design 5, Recharts, TipTap editor, react-day-picker, emoji-picker-react, react-easy-crop, InteractJS

**Maps:** Goong Maps & Geocoder

**Dev Tools:** ESLint 9 (flat config), Husky, lint-staged, Commitlint, Bundle Analyzer

</details>

---

## 🏗️ Project Structure

> _A place for everything, and everything in its place._

```
src/
├── 📱 app/                       # Next.js App Router
│   ├── (main)/                   # ✨ User-facing routes
│   │   ├── wardrobe/             #    → Your digital closet
│   │   ├── outfit/               #    → Create outfit combos
│   │   ├── collections/          #    → Organize by vibe
│   │   ├── suggest/              #    → AI recommendations
│   │   ├── calendar/             #    → Plan ahead
│   │   ├── community/            #    → Social features
│   │   └── ...more
│   ├── (auth)/                   # 🔐 Login, register, password reset
│   └── admin/                    # 👑 Admin dashboard
│
├── 🧩 components/
│   ├── ui/                       # shadcn + custom glass components
│   ├── wardrobe/                 # Wardrobe-specific UI
│   ├── community/                # Social features
│   ├── providers/                # Context wrappers
│   └── ...feature-based folders
│
├── 🪝 hooks/                     # Custom React hooks
│   ├── useAuth.ts                # Authentication logic
│   ├── useWardrobeOptions.ts     # Wardrobe filters
│   ├── useFeed.ts                # Community feed
│   └── ...many more
│
├── 📚 lib/
│   ├── api/                      # Axios clients with interceptors
│   ├── realtime/                 # SignalR connections
│   ├── utils/                    # Helper functions
│   └── validations/              # Zod schemas
│
└── 🗃️ store/                     # Zustand stores
    ├── auth-store.ts             # Who am I?
    ├── wardrobe-store.ts         # What do I own?
    ├── outfit-store.ts           # What am I creating?
    ---

## 🛣️ Routing

**Next.js App Router** with smart route groups:

```

(main)/ → 🌟 User experience: Navbar + glass effects + smooth scroll

(auth)/ → 🔐 Authentication: Clean, focused login/register flow

admin/ → 👑 Admin panel: Sidebar + analytics dashboard

### 🛡️ Protected Routes

The middleware gatekeeps like a bouncer at an exclusive club:

| Route                         | Who gets in?                                  |
| ----------------------------- | --------------------------------------------- |
| `/wardrobe/*`, `/community/*` | Authenticated users only                      |
| `/admin/*`                    | Admins and SuperAdmins                        |
| First-time users              | Auto-redirected to `/wardrobe` for onboarding |

### 🗺️ Route Map

| Destination        | What you'll find                             |
| ------------------ | -------------------------------------------- |
| `/`                | Landing page — make a great first impression |
| `/wardrobe`        | Your digital closet                          |
| `/outfit`          | Mix & match creator                          |
| `/suggest`         | AI stylist recommendations                   |
| `/calendar`        | Plan your week's looks                       |
| `/community`       | See what others are wearing                  |
| `/admin/dashboard` | The control room                             |

---

## 🧠 State Management

> _"Where does the data live?"_ — Every developer, every project

### The Split Strategy

| Layer               | Tool              | Purpose                       |
| ------------------- | ----------------- | ----------------------------- |
| 🏠 **Client State** | Zustand 5         | UI state, auth, local filters |
| 🌐 **Server State** | TanStack Query v5 | API data, caching, sync       |

### Zustand Stores

```typescript
auth-store     → 🔐 Who's logged in? Tokens, user info, permissions
wardrobe-store → 👔 Filters, search, selected items, cached wardrobe
outfit-store   → 👗 Current outfit being created
upload-store   → 📤 File upload progress tracking
```

### TanStack Query Magic

- **Query keys:** `['wardrobe', 'items', { category: 'tops' }]`
- **Stale time:** 2 minutes (keeps things snappy)
- **Optimistic updates:** UI updates before server confirms
- **DevTools:** Enabled in development for debugging

### API Client (`src/lib/api/client.ts`)

```
Request → Add JWT token → Send → 401? → Auto-refresh token → Retry → Success! 🎉
```

No more manual token management. It just works.

---

## 🔑 Environment Variables

Create a `.env.local` file and fill in the blanks:

```bash
# 🌐 API
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api

# 🔐 Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# 🔥 Firebase (Push Notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx

# 💳 Real-time Payments
NEXT_PUBLIC_PAYMENT_HUB_URL=https://your-api.com/paymentHub

# 🗺️ Maps (Goong)
NEXT_PUBLIC_GOONG_MAP_KEY=xxx
NEXT_PUBLIC_GOONG_API_KEY=xxx

# 📊 Debug
NEXT_PUBLIC_ANALYZE=false
```

---

## 🎨 Styling & Theming

### The Aesthetic

**Glass morphism meets modern minimalism.** Think frosted glass panels floating over a gradient background.

```css
/* The glass effect in a nutshell */
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.1),
  rgba(255, 255, 255, 0.05)
);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.18);
```

### Typography Trio

| Use          | Font                | Vibe               |
| ------------ | ------------------- | ------------------ |
| **Headings** | Bricolage Grotesque | Bold, expressive   |
| **Body**     | Poppins             | Clean, readable    |
| **Code**     | Geist Mono          | Developer-friendly |

### Glass Components

Custom components in `src/components/ui/`:

```tsx
<GlassCard blur="20px" glowColor="rgba(59, 130, 246, 0.3)">
  <GlassButton variant="primary">Looking good ✨</GlassButton>
</GlassCard>
```

Available: `GlassCard`, `GlassButton`, `GlassBadge`, `GlassCursor`

---

## 📡 API Integration

### API Modules

Everything lives in `src/lib/api/`:

| Module             | Purpose                      |
| ------------------ | ---------------------------- |
| `auth-api`         | Login, register, tokens      |
| `wardrobe-api`     | CRUD for clothing items      |
| `outfit-api`       | Outfit combinations          |
| `collection-api`   | User collections             |
| `community-api`    | Posts, follows, likes        |
| `weather-api`      | Weather data for suggestions |
| `subscription-api` | Premium features             |
| `admin-api`        | Admin operations             |

### Real-time Features

- **SignalR** → Payment status updates (instant feedback)
- **Firebase FCM** → Push notifications (stay informed)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** (or your package manager of choice)

### Installation

```bash
# Clone it
git clone https://github.com/SOP-SmartOutfitPlanner/sop-web.git
cd sop-web

# Install everything
npm install
```

### Fire it up

```bash
npm run dev
```

🚀 Open [https://localhost:3000](https://localhost:3000) — yes, HTTPS in dev mode with Turbopack!

### Production Build

```bash
npm run build    # Create optimized build
npm run start    # Run production server
```

---

## 🧹 Code Quality

### Linting

```bash
npm run lint
```

**ESLint 9** with:

- Next.js core web vitals
- TypeScript strict rules
- Flat config format

### Commit Messages

We use **Conventional Commits** enforced by Commitlint + Husky:

```bash
feat: add outfit recommendation engine
fix: resolve token refresh loop
docs: update API documentation
refactor: simplify wardrobe filtering logic
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## 🐳 Deployment

### Docker

```bash
# Build the image
docker build -t sop-web .

# Run it (port 6969, nice)
docker run -d -p 6969:6969 sop-web
```

**Multi-stage build** for optimal image size:

1. `deps` → Install node_modules
2. `builder` → Compile Next.js
3. `runner` → Lean production image

### CI/CD Pipeline

Push to `main` → GitHub Actions kicks in:

```
✓ Build Docker image
✓ Push to Docker Hub
✓ Deploy to VPS (self-hosted runner)
✓ Profit 💰
```

---

## 📄 License

No license file is present in this repository.

---

<div align="center">

**Built with ☕ and questionable fashion choices**

_Made by the SOP Team_

</div>
