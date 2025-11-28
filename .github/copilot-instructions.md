# GitHub Copilot Instructions - SOP Web

**Smart Outfit Planner** - AI-powered digital wardrobe with image analysis, smart filtering, and role-based admin

## Tech Stack

- **Framework**: Next.js 15.5.3 (App Router) + React 19 + TypeScript 5 (strict)
- **Build**: Turbopack (dev + build)
- **UI**: Tailwind CSS 4 + shadcn/ui (Radix) + Glass morphism design system
- **Animation**: Framer Motion 12 + GSAP 3 + Lenis smooth scroll
- **State**: Zustand 5 (global) + TanStack Query v5 (server state)
- **Forms**: React Hook Form 7 + Zod 4 validation
- **API**: Axios with auto JWT refresh + SignalR real-time
- **Search**: Fuse.js client-side fuzzy search

## Critical Architecture Patterns

### API Client (`src/lib/api/client.ts`)

**Auto Token Refresh Flow:**

```typescript
Request → Add Bearer token → 401/403 → Auto refresh → Retry original → Success
```

- **Interceptors**: Request adds JWT, response handles refresh on 401/403
- **Token Storage**: localStorage + httpOnly cookies (via API response)
- **Singleton**: `apiClient` instance shared across all API modules
- **Usage**: Import `apiClient` not axios - never create new instances

### Authentication Flow

**JWT Claims Structure** (extract with `extractUserFromToken()` from `src/lib/utils/jwt.ts`):

```typescript
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": email,
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User" | "Admin" | "SuperAdmin",
  "UserId": string,
  "FirstTime": "true" | "false",
  "exp": timestamp
}
```

**Login Endpoint is `/auth` NOT `/auth/login`**

**Middleware Protection** (`middleware.ts`):

- Admin routes: Decode JWT from cookies, check role, redirect if unauthorized
- First-time users: Redirect to `/wardrobe` for onboarding
- Community/wardrobe: Require authentication

### State Management Strategy

**Zustand** (`src/store/`) - UI state & auth:

- `auth-store.ts`: User session, login/logout, `initializeAuth()` on mount
- `wardrobe-store.ts`: Local filters, search, selection mode, items cache
- `outfit-store.ts`: Outfit creation state
- `upload-store.ts`: File upload state
- **Pattern**: `export const useXxxStore = create<XxxStore>((set, get) => ({ ... }))`

**TanStack Query** (`src/hooks/`) - Server state:

- Query keys: `['wardrobe', 'list', filters]` for cache invalidation
- Optimistic updates: `addItemOptimistic()` in wardrobe-store, then query invalidation
- `staleTime: 2 * 60 * 1000` (2 min) to reduce refetches
- **Pattern**: Named exports like `useWardrobeOptions()`, `useAuth()`

**Critical**: Wardrobe store DOES cache items (`items: WardrobeItem[]`) for client-side filtering with Fuse.js

### Route Groups & Layouts

```
app/
├── (main)/          → User portal: Navbar + glass effects + Lenis scroll
├── (auth)/          → Auth pages: Fixed layout, no scroll
├── (admin)/         → New admin: Sidebar + header (PREFERRED)
└── admin/           → Legacy admin (MIGRATE TO (admin)/)
```

**Layout inheritance**: `app/layout.tsx` wraps with providers → Route group layouts add specific UI

### API Response Transformation

**Backend sends different format than frontend expects:**

```typescript
// API Response (src/lib/api/wardrobe-api.ts)
ApiWardrobeItem: { categoryId, categoryName, color: string, tag: string }

// Frontend Model (src/types/item.ts)
WardrobeItem: { type, colors: string[], tags: string[] }

// Transform: wardrobeStore.apiItemToWardrobeItem()
```

**Defensive parsing required** - API responses are inconsistent:

```typescript
const apiData = response.data.data;
if (apiData?.data && Array.isArray(apiData.data)) {
  items = apiData.data; // Paginated
} else if (Array.isArray(apiData)) {
  items = apiData; // Direct array
}
```

### Real-time with SignalR

**Payment Hub** (`src/lib/realtime/payment-hub.ts`):

```typescript
const connection = buildPaymentHubConnection();
await connection.start();
connection.on("PaymentStatusUpdate", handler);
```

- Auto-reconnect enabled
- Use `withCredentials: false` - auth via `accessTokenFactory` if needed
- Check `connection.state` before invoking methods

## Coding Standards

### TypeScript Rules

- **Strict mode** - no `any`, use `unknown` or proper types
- `interface` for object shapes, `type` for unions/intersections
- All props/returns must be typed
- Use type guards for runtime checks

### Component Patterns

```tsx
"use client"; // Required for hooks, use sparingly

// Functional components only
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // useCallback for handlers passed to children
  const handleClick = useCallback(() => {}, [deps]);

  // useMemo for expensive computations
  const filteredData = useMemo(() => items.filter(...), [items]);

  return <GlassCard>{content}</GlassCard>;
};

export default memo(ComponentName); // Memo for pure components
```

### File Naming

- **Components**: `PascalCase.tsx` (`AddItemWizard.tsx`)
- **Utils/APIs**: `kebab-case.ts` (`auth-api.ts`, `wardrobe-store.ts`)
- **Hooks**: `camelCase.ts` (`useAuth.ts`, `useWardrobeQuery.ts`)
- **Import alias**: `@/*` = `src/*`

### Styling with Glass Morphism

**Always use custom glass components from `src/components/ui/`:**

```tsx
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";

<GlassCard
  padding="1.5rem"
  blur="10px"
  brightness={1.1}
  borderRadius="16px"
  glowColor="rgba(59, 130, 246, 0.3)"
  glowIntensity={12}
>
  <GlassButton variant="primary" size="md" onClick={handleAction}>
    Action
  </GlassButton>
</GlassCard>;
```

**Typography**:

- Headings: `font-bricolage` (Bricolage Grotesque - expressive, bold)
- Body: `font-poppins` (Poppins - clean, readable)

**Never use inline styles** - Tailwind utilities only

### Animations

```tsx
// Framer Motion for UI interactions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// Common patterns: fade (opacity), slide (y), scale
// Stagger children: delayChildren + staggerChildren
```

## Development Workflows

### Running the App

```bash
npm run dev              # Dev server with Turbopack (https://localhost:3000)
npm run build            # Production build
npm start                # Production server
npm run lint             # ESLint (flat config, Next.js rules)
```

**No test framework** - manual testing required (TODO: add Jest + RTL)

### Environment Setup

**Required `.env.local`**:

```bash
NEXT_PUBLIC_API_BASE_URL=https://sop.wizlab.io.vn/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-id>
```

**Image domains** configured in `next.config.ts`:

- `storage.wizlab.io.vn/sop/**`
- `sop.wizlab.io.vn/**`

### Adding New API Endpoints

**Two patterns exist in the codebase:**

**Pattern A - Class-based** (wardrobeAPI, authAPI, userAPI, outfitAPI):

```typescript
class FeatureAPI {
  private readonly BASE_PATH = "/feature";

  async getItems() {
    return apiClient.get<Response>(`${this.BASE_PATH}`);
  }
}
export const featureAPI = new FeatureAPI();
```

**Pattern B - Object literal** (adminAPI, subscriptionAPI, CalenderAPI):

```typescript
export const featureAPI = {
  getItems: async () => {
    return apiClient.get<Response>("/feature");
  },
};
```

**Choose Pattern A for complex services, Pattern B for simple utilities**

**React Query hook pattern**:

```typescript
export function useFeatureQuery() {
  return useQuery({
    queryKey: ["feature"],
    queryFn: () => featureAPI.getItems(),
    staleTime: 2 * 60 * 1000, // 2 min
  });
}
```

### Form Validation

**Use existing Zod schemas** in `src/lib/validations/`:

```typescript
import { loginSchema } from "@/lib/validations/auth";

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

### Error Handling

```typescript
try {
  await apiCall();
  toast.success("Success message");
} catch (error) {
  console.error("Context:", error);
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error("Something went wrong");
  }
}
```

**Always show loading states:**

```typescript
const [isLoading, setIsLoading] = useState(false);
if (isLoading) return <LoadingSpinner />;
```

## Key Files Reference

**Read these first when working on specific features:**

- **Auth**: `src/store/auth-store.ts` (login flow), `src/lib/utils/jwt.ts` (token decode)
- **Wardrobe**: `src/components/wardrobe/wizard/AddItemWizard.tsx` (main upload flow)
- **API Client**: `src/lib/api/client.ts` (interceptors, token refresh)
- **Middleware**: `middleware.ts` (route protection logic)
- **Types**: `src/lib/types/index.ts` (shared interfaces)
- **Utilities**: `src/lib/utils/wizard-transform.ts` (form data transforms), `src/lib/utils/color-mapping.ts` (color parsing)
- **Architecture**: `docs/PROJECT_BRIEF.md` (comprehensive onboarding)

## Known Issues & Patterns

### TODO Features (Don't Implement Yet)

- **Wear Tracking**: Sort by most/least worn returns unsorted (no backend support)
- **Edit Item**: ItemGrid logs to console, no UI modal yet
- **Use in Outfit**: Placeholder - outfit builder not implemented

### API Quirks

**String bodies** (not JSON objects):

```typescript
// Refresh token & Google OAuth send raw strings
apiClient.post("/auth/refresh-token", refreshToken); // string, not { refreshToken }
apiClient.post("/auth/login/google/oauth", credential); // string, not { credential }
```

**Inconsistent response nesting**:

```typescript
// Sometimes: response.data.data.data (paginated)
// Sometimes: response.data.data (direct array)
// Always use defensive parsing or standardize
```

### Performance Considerations

- **No pagination** - wardrobe loads all items at once (slow for 100+ items)
- **Client-side search** - Fuse.js can lag with large datasets, consider debouncing
- **Image optimization disabled in dev** - `unoptimized: true` in next.config.ts
- **Large animation bundle** - Framer Motion + GSAP + Lenis + InteractJS loaded upfront

### Duplicate Admin Routes

**Use `src/app/(admin)/`** for new admin features, not `src/app/admin/` (legacy)

## Common Tasks

### Adding a New Feature Module

1. **Create types** in `src/types/<feature>.ts`
2. **API client** in `src/lib/api/<feature>-api.ts` (use `apiClient`)
3. **Zustand store** (optional) in `src/store/<feature>-store.ts`
4. **React Query hooks** in `src/hooks/use<Feature>.ts`
5. **Components** in `src/components/<feature>/`
6. **Page** in `src/app/(main)/<feature>/page.tsx`

### Debugging Auth Issues

1. Check `localStorage` for `accessToken` and `refreshToken`
2. Decode JWT at jwt.io to verify claims structure
3. Check `middleware.ts` console logs for route protection
4. Verify `apiClient.ts` interceptor logic (401/403 handling)
5. Test with admin account? Use `/admin/login`, not `/login`

### Working with Glass Components

**Don't override glass styles** - use provided props:

```tsx
// ✅ Good
<GlassCard blur="20px" brightness={1.2} glowIntensity={16} />

// ❌ Bad
<GlassCard className="backdrop-blur-xl brightness-125" />
```

**For custom glass effects**, replicate the pattern from `glass-card.tsx`:

```css
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.1),
  rgba(255, 255, 255, 0.05)
);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.18);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

## Anti-Patterns to Avoid

❌ **Creating new axios instances**

```typescript
const api = axios.create({ baseURL: "..." }); // DON'T - loses token refresh
```

✅ Use `apiClient` from `src/lib/api/client.ts`

❌ **Direct localStorage access for auth tokens**

```typescript
localStorage.getItem("accessToken"); // DON'T - bypasses auth store
```

✅ Use `useAuthStore()` which manages tokens via `apiClient`

❌ **Hardcoded API URLs**

```typescript
fetch("https://sop.wizlab.io.vn/api/items"); // DON'T
```

✅ Use API modules: `wardrobeAPI.getItems()`

❌ **Missing "use client" directive with hooks**

```typescript
// This will fail - needs "use client"
export default function Component() {
  const [state, setState] = useState();
}
```

❌ **Bypassing utility functions**

```typescript
// DON'T manually parse colors
const colors = colorString.split(",");
```

✅ Use existing utils: `parseColors()`, `colorNameToHex()` from `src/lib/utils/color-mapping.ts`

## Quick Reference

### Common Imports

```typescript
// API
import { apiClient } from "@/lib/api/client";
import { wardrobeAPI } from "@/lib/api/wardrobe-api";
import { authAPI } from "@/lib/api/auth-api";

// State
import { useAuthStore } from "@/store/auth-store";
import { useWardrobeStore } from "@/store/wardrobe-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// UI
import GlassCard from "@/components/ui/glass-card";
import GlassButton from "@/components/ui/glass-button";
import { toast } from "sonner";

// Animation
import { motion, AnimatePresence } from "framer-motion";

// Forms
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

### Query Key Patterns

```typescript
// Wardrobe
["wardrobe", "list", filters][("wardrobe", "detail", id)][ // Filtered list // Single item
  // Auth (if using React Query)
  ("auth", "user")
][ // Current user
  // Admin
  ("admin", "users", { page, search })
][("admin", "categories")];
```
