# GitHub Copilot Instructions - SOP Web Project

## 🎯 Project Overview
**Smart Outfit Planner (SOP)** - Digital Wardrobe Management System

### Tech Stack
- **Framework**: Next.js 15.5.3 (App Router) + React 19.1.0
- **Language**: TypeScript 5 (strict mode)
- **Build Tool**: Turbopack
- **UI**: Tailwind CSS 4 + shadcn/ui (Radix UI) + Framer Motion 12 + GSAP 3
- **State**: Zustand 5 + TanStack Query v5
- **API**: Axios REST client with JWT auth
- **Forms**: React Hook Form 7 + Zod 4
- **Style**: Glass morphism design system

### Key Features
- **Wardrobe Management**: CRUD items with AI analysis
- **AI-Powered**: Auto-detect color, pattern, fabric, weather from images
- **Smart Search**: Fuse.js fuzzy search + filters (season, color, category, occasion)
- **Collections**: Organize by Casual, Formal, Sport, Travel
- **Admin Dashboard**: User/category management, role-based access

## 📋 Coding Standards

### TypeScript
- **Strict mode enabled** - no implicit any
- Use `interface` for objects, `type` for unions
- Define all props with proper types
- Never use `any` - use `unknown` if type is truly unknown

### React Components
- Use `"use client"` directive for client components
- Functional components with hooks only
- Prefer `useCallback` and `useMemo` for optimization
- Files: PascalCase for components (`ComponentName.tsx`)

### Naming Conventions
- **Files**: kebab-case (`auth-store.ts`, `wardrobe-api.ts`)
- **Components**: PascalCase (`AddItemWizard.tsx`)
- **Folders**: By feature (auth, wardrobe, admin) + shared (ui, layout)
- **Import alias**: `@/*` maps to `./src/*`

### Styling
- **Tailwind utility classes** - no inline styles
- **Glass components**: Use `GlassCard`, `GlassButton` from ui library
- **Fonts**: 
  - `font-bricolage` (Bricolage Grotesque) for headings
  - `font-poppins` (Poppins) for body text
- **Animations**: framer-motion for interactions, GSAP for advanced

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # User routes (with navbar, glass effects)
│   │   ├── page.tsx       # Landing page
│   │   ├── wardrobe/      # Wardrobe management
│   │   └── layout.tsx     # Navbar + Preloader
│   ├── (auth)/            # Auth routes (login, register, forgot-password)
│   │   └── layout.tsx     # Fixed layout, no scroll
│   ├── (admin)/           # Admin routes (dashboard, users, items)
│   │   └── layout.tsx     # Admin sidebar + header
│   └── layout.tsx         # Root (providers, fonts, globals.css)
├── components/
│   ├── auth/              # Auth forms (LoginForm, RegisterForm, OTP)
│   ├── layout/            # Headers, sidebars, navbar
│   ├── wardrobe/          # Wardrobe components
│   │   └── wizard/        # Multi-step Add Item wizard
│   ├── ui/                # shadcn/ui + custom glass components
│   └── providers/         # Context providers
├── hooks/                 # Custom hooks (useAuth, useWardrobeQuery)
├── lib/
│   ├── api/               # API clients (auth, wardrobe, admin)
│   │   └── client.ts      # Axios instance with auto token refresh
│   ├── constants/         # App constants
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
├── store/                 # Zustand stores (auth, wardrobe)
└── types/                 # Global type definitions
```

## 🎨 Design System

### Glass Morphism Components
Always use custom glass components for containers and buttons:

```tsx
// GlassCard - containers with frosted glass effect
<GlassCard
  padding="1.5rem"
  blur="10px"
  brightness={1.1}
  borderRadius="16px"
  glowColor="rgba(59, 130, 246, 0.3)"
  glowIntensity={12}
>
  {children}
</GlassCard>

// GlassButton - primary actions
<GlassButton
  variant="primary"
  size="md"
  onClick={handleClick}
  borderRadius="12px"
  blur="8px"
>
  Action
</GlassButton>
```

### Design Tokens
- **Primary Colors**: Blue (`#3B82F6`, `#2563EB`)
- **Success**: Green (`#10B981`)
- **Error**: Red (`#EF4444`)
- **Neutrals**: Tailwind gray scale
- **Backgrounds**: Glass morphism with blur + transparency

### Typography
- **Headings**: `font-bricolage` (Bricolage Grotesque) - Bold, expressive
- **Body**: `font-poppins` (Poppins) - Clean, readable
- **Monospace**: System font stack

### Animations & Motion
```tsx
// Use framer-motion for component animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// Common animation patterns:
// - Fade in/out: opacity 0 → 1
// - Slide up: y: 20 → 0
// - Scale: scale: 0.95 → 1
// - Stagger children with delayChildren + staggerChildren
```

## 🔄 Current Feature: Multi-Item Upload Flow

### Context & Goal
Implementing a simplified wardrobe item upload flow similar to mobile gallery apps:

**Desired Flow:**
1. User selects **1 image** from gallery/camera
2. **Auto-trigger AI analysis** (no manual button click)
3. Show form to edit AI-detected details
4. Save item and close

**Key Changes from Current:**
- ❌ Remove manual "Upload & Analyze" button → ✅ Auto-analyze on file select
- ❌ Remove/make optional cropping step → ✅ Direct to analysis
- ⚠️ Keep single image flow (not multiple images at once)

### Existing Components to Reuse

**Core Wizard:**
- `src/components/wardrobe/wizard/AddItemWizard.tsx` - Main wizard flow
  - Status: `IDLE → CROPPING → PREVIEW → ANALYZING → FORM → SAVED`
  - Handlers: `handleFileSelect`, `handleAnalyze`, `handleSave`
  - Can be extended with `initialFile` prop

**Form & UI:**
- `ItemFormContent.tsx` - Form for editing item details
- `AnalyzingPanel.tsx` - AI analysis progress animation
- `AnalysisOverlay.tsx` - Progress overlay on image preview
- `ImageCropper.tsx` - Optional crop tool (can skip)

**New Wrapper:**
- `GalleryPickerFlow.tsx` - Gallery selection UI → Opens AddItemWizard

### API Endpoints

**AI Analysis:**
```typescript
POST /api/v1/items/analysis
Content-Type: multipart/form-data
Body: { file: File }

Response: {
  statusCode: 200,
  message: "Get summary image successfully",
  data: {
    name: string,
    colors: [{ name: string, hex: string }],
    aiDescription: string,
    weatherSuitable: string,
    condition: string,
    pattern: string,
    fabric: string,
    imageRemBgURL: string,
    category: { id: number, name: string },
    styles: [{ id: number, name: string }],
    occasions: [{ id: number, name: string }],
    seasons: [{ id: number, name: string }]
  }
}
```

**Create Item:**
```typescript
POST /api/v1/items
Content-Type: application/json
Body: {
  userId: number,
  name: string,
  categoryId: number,
  categoryName: string,
  color: string,  // Join colors array to string
  aiDescription: string,
  brand?: string,
  imgUrl: string,  // Use imageRemBgURL from analysis
  weatherSuitable: string,
  condition: string,
  pattern: string,
  fabric: string,
  tag?: string,  // Join tags array to string
  // styleIds, occasionIds, seasonIds: Extract from analysis response
}

Response: {
  statusCode: 201,
  message: "Item created successfully",
  data: { id: number, ... }
}
```

**API Utilities:**
- `wardrobeAPI.getImageSummary(file: File)` - AI analysis
- `wardrobeAPI.createItem(payload)` - Create item
- `transformWizardDataToAPI()` - Convert form data to API format
- `validateWizardFormData()` - Form validation

## ✅ Code Quality Rules

### Before Creating New Components
1. Check if similar component exists in `src/components/`
2. Reuse existing UI components from `src/components/ui/`
3. Use existing utilities from `src/lib/utils/`

### Error Handling
```typescript
try {
  const result = await apiCall();
  toast.success("Success message");
} catch (error) {
  console.error("Context:", error);
  toast.error("User-friendly message");
}
```

### Loading States
Always show loading UI:
```typescript
const [isLoading, setIsLoading] = useState(false);

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Form Validation
Use existing validators in `src/lib/validations/`

## 🚫 What NOT to Do

- ❌ Don't use inline styles
- ❌ Don't create duplicate components
- ❌ Don't use `any` type
- ❌ Don't hardcode API URLs (use apiClient)
- ❌ Don't ignore TypeScript errors
- ❌ Don't create new UI primitives (use shadcn/ui)

## 📚 Read These Files First

When working on specific features:
- Multi-image upload: `docs/FLOW_ANALYSIS.md`
- Wizard flow: `src/components/wardrobe/wizard/AddItemWizard.tsx`
- API structure: `src/lib/api/wardrobe-api.ts`
- Type definitions: `src/components/wardrobe/wizard/types.ts`

## 🎯 Current Task Context

Reference `docs/FLOW_ANALYSIS.md` for detailed analysis of:
- Current flow vs desired flow
- Components that can be reused
- Changes needed for multi-item upload
- Implementation options (A vs B)

When implementing, prefer:
- **Option A**: Extend existing AddItemWizard (less code duplication)
- Auto-trigger AI analysis (no manual button click)
- Skip/Optional cropping step
- Show progress indicator (1/3, 2/3, etc.)
- Add "Skip" button to move to next image
