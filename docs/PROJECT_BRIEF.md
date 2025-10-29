# SOP Web - Project Onboarding Guide

**Smart Outfit Planner** - Digital Wardrobe Management System

---

## 📋 Mục lục

1. [Tóm tắt cao cấp](#1-tóm-tắt-cao-cấp)
2. [Bản đồ Codebase](#2-bản-đồ-codebase)
3. [API & Data](#3-api--data)
4. [Build & Chạy](#4-build--chạy)
5. [Nợ kỹ thuật / Issue](#5-nợ-kỹ-thuật--issue)
6. [Backlog gợi ý](#6-backlog-gợi-ý)

---

## 1. TÓM TẮT CAO CẤP

### 🎯 Mục tiêu sản phẩm
**SOP (Smart Outfit Planner)** là một ứng dụng quản lý tủ đồ kỹ thuật số với khả năng:
- **Quản lý wardrobe**: Thêm, xóa, sửa item quần áo với ảnh và metadata
- **AI-powered analysis**: Phân tích ảnh quần áo tự động (màu sắc, chất liệu, pattern, thời tiết phù hợp)
- **Smart filtering**: Tìm kiếm fuzzy search, lọc theo mùa/màu sắc/occasion/category
- **Collections**: Tổ chức quần áo theo bộ sưu tập (Casual, Formal, Sport, Travel)
- **Admin dashboard**: Quản lý users, categories, items (role-based access)

### 👥 Đối tượng người dùng
- **End users**: Người dùng thông thường quản lý tủ đồ cá nhân
- **Admins**: Quản trị viên quản lý hệ thống, users, categories

### 🛠 Tech Stack

#### **Framework & Core**
- **Next.js 15.5.3** (App Router) + React 19.1.0
- **TypeScript 5** (strict mode)
- **Turbopack** cho dev/build nhanh hơn

#### **UI & Styling**
- **Tailwind CSS 4** (với @tailwindcss/postcss)
- **shadcn/ui** (Radix UI primitives) - New York style
- **Framer Motion 12** + GSAP 3 cho animations
- **Lenis** cho smooth scrolling
- **Lucide React** icons

#### **State Management**
- **Zustand 5** cho global state (auth-store, wardrobe-store)
- **TanStack Query v5** cho server state (caching, optimistic updates)
- **React Hook Form 7** + Zod 4 cho form validation

#### **API & Data**
- **Axios** REST API client với interceptors
- **JWT** authentication (access + refresh tokens)
- **Fuse.js** cho fuzzy search

#### **Dev Tools**
- **ESLint 9** (flat config) + Next.js rules
- **Stagewise** (port 3100) cho collaboration
- **Google OAuth** (@react-oauth/google)

### 🏗 Kiến trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # User-facing routes (with layout)
│   │   ├── page.tsx       # Landing page
│   │   ├── wardrobe/      # Wardrobe management
│   │   └── layout.tsx     # Navbar + Glass cursor + Preloader
│   ├── (auth)/            # Auth routes (login, register, forgot-password)
│   │   └── layout.tsx     # Fixed overflow-hidden layout
│   ├── (admin)/           # New admin routes (dashboard, users, items)
│   │   └── layout.tsx     # Admin sidebar + header
│   ├── admin/             # Legacy admin routes
│   │   ├── login/         # Admin login (separate from user login)
│   │   └── layout.tsx     # Admin-specific layout
│   └── layout.tsx         # Root layout (providers, fonts, globals.css)
├── components/
│   ├── auth/              # Auth forms (login, register, OTP verification)
│   ├── layout/            # Headers, sidebars, navbar
│   ├── wardrobe/          # Wardrobe-specific components
│   │   └── wizard/        # Multi-step Add Item wizard
│   ├── ui/                # shadcn/ui components + custom glass components
│   └── providers/         # Context providers (Auth, Query, Google OAuth)
├── hooks/                 # Custom hooks (useAuth, useWardrobeQuery, useAdminUsers)
├── lib/
│   ├── api/               # API clients (auth-api, wardrobe-api, admin-api)
│   │   └── client.ts      # Axios instance với auto token refresh
│   ├── constants/         # App constants
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions (JWT, color mapping, image utils)
│   └── validations/       # Zod schemas
├── store/                 # Zustand stores
└── types/                 # Global type definitions
```

### 🧭 Naming Conventions
- **Files**: kebab-case (e.g., `auth-store.ts`, `wardrobe-api.ts`)
- **Components**: PascalCase (e.g., `AddItemWizard.tsx`)
- **Import alias**: `@/*` → `./src/*`
- **Folder organization**: **By feature** (auth, wardrobe, admin) + shared (ui, layout)

### 🚦 Routing & Middleware

#### **Route Groups**
- `(main)`: User-facing pages với glass effects, smooth scroll
- `(auth)`: Auth flows với fixed layout, no scroll
- `(admin)`: New admin dashboard với sidebar
- `admin/`: Legacy admin routes (will migrate to `(admin)`)

#### **Middleware** (`middleware.ts`)
- **Protect admin routes**: `/admin/*` requires JWT với role `ADMIN` hoặc `SuperAdmin`
- **Token validation**: Decode JWT từ cookies, check role
- **Auto redirect**: 
  - No token → `/admin/login`
  - Not admin role → `/admin/login`
  - Already admin logged in + access `/admin/login` → `/admin/dashboard`

#### **Auth Flow**
1. **User login**: POST `/auth` → Nhận access + refresh tokens → Extract user từ JWT
2. **Admin check**: Middleware reject nếu user có role admin login vào user portal
3. **Token refresh**: Auto refresh khi 401/403 (handled by API client interceptor)
4. **Logout**: Clear tokens + localStorage + redirect

---

## 2. BẢN ĐỒ CODEBASE

### 📂 Cây thư mục rút gọn

```
sop-web/
├── public/                # Static assets (logos, images)
│   ├── sop-logo*.png
│   └── main-theme.jpg
├── src/
│   ├── app/              # Pages (Next.js 15 App Router)
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Core logic (API, utils, types)
│   ├── store/            # Zustand state
│   └── types/            # Global TypeScript types
├── components.json       # shadcn/ui config
├── middleware.ts         # Route protection
├── next.config.ts        # Next.js config (image domains)
├── package.json          # Dependencies
├── postcss.config.mjs    # Tailwind PostCSS
├── stagewise.json        # Stagewise config
└── tsconfig.json         # TypeScript config
```

### 🎨 Module/Miền chức năng

#### **1. Authentication (`auth`)**
**Files:**
- `src/app/(auth)/login/`, `register/`, `forgot-password/`, `verify-email/`, `reset-password/`
- `src/components/auth/` (LoginForm, RegisterForm, AuthContainer, GoogleLoginButton)
- `src/lib/api/auth-api.ts`
- `src/store/auth-store.ts`
- `src/hooks/useAuth.ts`

**Features:**
- Email/password login & register
- Google OAuth integration
- Email verification via OTP
- Password reset flow (forgot → OTP verify → reset)
- Admin login separation (different portal)
- JWT token management (access + refresh)

**Key Flows:**
- **Register** → OTP verification → Login
- **Login** → Extract user from JWT → Dashboard
- **Forgot password** → Request OTP → Verify OTP → Reset with token

---

#### **2. Wardrobe Management (`wardrobe`)**
**Files:**
- `src/app/(main)/wardrobe/page.tsx`
- `src/components/wardrobe/` (ItemCard, ItemGrid, Toolbar, WardrobeHeader, AddItemWizard)
- `src/lib/api/wardrobe-api.ts`
- `src/store/wardrobe-store.ts`
- `src/hooks/useWardrobeQuery.ts`

**Features:**
- **CRUD items**: Create (wizard), Read (grid), Update, Delete (single + bulk)
- **AI analysis**: Upload ảnh → API phân tích → Tự động fill color, pattern, fabric, weather
- **Fuzzy search**: Fuse.js tìm kiếm theo name, brand, colors, tags
- **Filters**: Category, season, color, occasion, collection
- **Sorting**: Newest, A-Z, Z-A, Most/Least worn (TODO)
- **Collections**: Organize by occasion (Casual, Formal, Sport, Travel)
- **Selection mode**: Bulk select + bulk delete

**Add Item Wizard:**
- **Step 1**: Upload image → AI analysis (màu, chất liệu, pattern, thời tiết)
- **Step 2**: Basic info (name, brand, notes)
- **Step 3**: Categorize (category, season, tags, condition)

**State Management:**
- **Zustand**: Local state (items, filters, selection mode)
- **TanStack Query**: Server state với optimistic updates

---

#### **3. Admin Dashboard (`admin`)**
**Files:**
- `src/app/(admin)/dashboard/`, `users/`, `items/`, `layout.tsx`
- `src/app/admin/` (legacy)
- `src/components/layout/admin-sidebar.tsx`, `admin-header.tsx`
- `src/lib/api/admin-api.ts`
- `src/hooks/useAdminUsers.ts`, `useAdminCategories.ts`

**Features:**
- **User management**: List, search, filter, view details, change role, block/unblock
- **Category management**: CRUD categories (parent-child relationship)
- **Item management**: View all users' items
- **Dashboard stats**: User count, item count, category usage (mock)

**Access Control:**
- Middleware check JWT role
- Frontend double-check trong layout
- Separate login portal (`/admin/login`)

---

### 🧩 Thành phần UI tái sử dụng

#### **shadcn/ui Components** (`src/components/ui/`)
```
button, input, label, form, card, dialog, alert-dialog, 
dropdown-menu, select, checkbox, radio-group, switch, 
table, avatar, badge, progress, slider, tooltip, 
popover, command, sonner (toast)
```

#### **Custom Glass Components**
- `glass-card.tsx`: Card với glass effect, draggable, glow
- `glass-button.tsx`: Button với glass effect, animations
- `glass-cursor.tsx`: Custom cursor với hover effects
- `optimized-image.tsx`: Next Image wrapper với blur placeholder
- `preloading.tsx`: Loading animation screen

#### **Style Tokens** (`src/app/globals.css`)
```css
:root {
  /* Base colors (HSL) */
  --background, --foreground, --primary, --secondary, --accent
  --muted, --border, --input, --ring
  
  /* Login-specific */
  --login-navy, --login-teal, --login-blue, --login-gray
  
  /* Custom fonts */
  --font-geist-sans, --font-bricolage-grotesque, --font-dela-gothic
}
```

#### **Theme System**
- Light mode default
- Dark mode tokens defined (not actively used)
- Custom Tailwind colors mapped to CSS variables
- Gradient backgrounds: `from-login-navy to-login-blue`

---

### 🗄 State Management

#### **Zustand Stores**

**1. `auth-store.ts`**
```typescript
State:
- user: User | null
- isAuthenticated: boolean
- isLoading: boolean
- error, successMessage: string | null
- requiresVerification: boolean
- pendingVerificationEmail: string | null

Actions:
- login(email, password) → Extract user from JWT
- loginWithGoogle(credential) → Handle OAuth
- register(credentials) → May require email verification
- logout() → Clear all storage + redirect
- initializeAuth() → Load from localStorage on mount
```

**2. `wardrobe-store.ts`**
```typescript
State:
- items: WardrobeItem[]
- filteredItems: WardrobeItem[]
- filters: WardrobeFilters
- searchQuery: string
- isLoading, error: string | null
- sortBy: string
- selectedItems: string[]
- isSelectionMode: boolean
- hasInitialFetch: boolean

Actions:
- fetchItems() → GET /items/user/{userId}
- addItem() → POST /items
- updateItem() → PUT /items/{id}
- deleteItem() → DELETE /items/{id}
- bulkDeleteItems() → Promise.all(deleteItem)
- setFilters(), clearFilters()
- setSearchQuery() → Fuse.js search
- setSortBy() → Sort filtered items
- toggleSelectionMode(), clearSelection()
```

#### **TanStack Query** (`src/hooks/useWardrobeQuery.ts`)
```typescript
Queries:
- useWardrobeItems(filters) → Cached list với staleTime 2 min
- useWardrobeItem(id) → Single item detail

Mutations:
- useCreateWardrobeItem() → Optimistic update
- useUpdateWardrobeItem() → Optimistic update
- useDeleteWardrobeItem() → Optimistic update

Query Keys:
- wardrobe.all = ['wardrobe']
- wardrobe.lists() = ['wardrobe', 'list']
- wardrobe.list(filters) = ['wardrobe', 'list', filters]
- wardrobe.detail(id) = ['wardrobe', 'detail', id]
```

---

## 3. API & DATA

### 🌐 Backend Base URL
**Environment Variable:** `NEXT_PUBLIC_API_BASE_URL`

**Example:** `https://sop.wizlab.io.vn/api` (hoặc local backend)

### 📡 API Endpoints

#### **Authentication API** (`/auth`)

| Method | Path | Input | Output | Notes |
|--------|------|-------|--------|-------|
| POST | `/auth` | `{ email, password }` | `{ accessToken, refreshToken }` | Login (not `/auth/login`) |
| POST | `/auth/register` | `{ email, displayName, password, confirmPassword }` | `{ email, message }` (201) | Requires email verification |
| POST | `/auth/login/google/oauth` | `credential` (string, not object) | `{ accessToken, refreshToken }` or `{ email, message }` (201) | Google OAuth |
| POST | `/auth/refresh-token` | `refreshToken` (string, not object) | `{ accessToken, refreshToken }` | Refresh access token |
| POST | `/auth/logout` | - | - | Server logout (optional) |
| POST | `/auth/otp/verify` | `{ email, otp }` | `{ message }` | Verify email OTP after register |
| POST | `/auth/otp/resend` | `{ email }` | `{ expiryMinutes, remainingAttempts }` | Resend OTP |
| POST | `/auth/password/forgot` | `{ email }` | `{ message }` | Request password reset OTP |
| POST | `/auth/password/verify-otp` | `{ email, otp }` | `{ resetToken, expiryMinutes }` | Verify OTP for password reset |
| POST | `/auth/password/reset` | `{ email, resetToken, newPassword, confirmPassword }` | `{ message }` | Reset password |

**Notes:**
- **No `/auth/me` endpoint**: User data extracted from JWT
- **JWT Payload** format:
```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "user@example.com",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "User",
  "UserId": "123",
  "FirstTime": "true",
  "exp": 1234567890
}
```

---

#### **Wardrobe API** (`/items`)

| Method | Path | Input | Output | Notes |
|--------|------|-------|--------|-------|
| GET | `/items/user/{userId}` | - | `{ data: { data: [...], metaData: {...} } }` | Get user's items |
| GET | `/items/{id}` | - | `{ data: {...} }` | Get single item |
| POST | `/items` | `CreateWardrobeItemRequest` | `{ data: {...} }` | Create new item |
| PUT | `/items/{id}` | `Partial<CreateWardrobeItemRequest>` | `{ data: {...} }` | Update item |
| DELETE | `/items/{id}` | - | - | Delete item |
| POST | `/items/analysis` | `FormData { file: File }` | `{ data: { color, aiDescription, weatherSuitable, condition, pattern, fabric, imageRemBgURL } }` | AI analysis |

**CreateWardrobeItemRequest:**
```typescript
{
  userId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  aiDescription: string;
  brand?: string;
  frequencyWorn?: string;
  lastWornAt?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  tag?: string;
}
```

---

#### **Admin API** (`/user`, `/categories`)

| Method | Path | Input | Output | Notes |
|--------|------|-------|--------|-------|
| GET | `/user` | `?page&pageSize&search&role&isVerified&isPremium` | `{ data: { data: [...], metaData: {...} } }` | List users (Admin only) |
| GET | `/user/{id}` | - | `{ data: {...} }` | Get user by ID |
| PATCH | `/user/{id}/role` | `{ role: number }` | - | Update user role |
| PATCH | `/user/{id}/status` | `{ isActive: boolean }` | - | Block/unblock user |
| DELETE | `/user/{id}` | - | - | Delete user |
| GET | `/categories` | `?page&pageSize` | `{ data: { data: [...], metaData: {...} } }` | List categories |
| GET | `/categories/parent/{id}` | `?page&pageSize` | `{ data: { data: [...], metaData: {...} } }` | Categories by parent |
| POST | `/categories` | `{ name, parentId }` | `{ data: {...} }` | Create category |
| PUT | `/categories/{id}` | `{ name, parentId }` | `{ data: {...} }` | Update category |
| DELETE | `/categories/{id}` | - | - | Delete category |

---

### 🗂 Models/Schema chính

#### **User**
```typescript
{
  id: string;
  displayName: string;
  email: string;
  role: "User" | "Admin" | "SuperAdmin";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

#### **WardrobeItem** (Frontend)
```typescript
{
  id: string;
  userId: string;
  name: string;
  type: "top" | "bottom" | "shoes" | "outer" | "accessory";
  imageUrl: string;
  brand?: string;
  colors: string[];
  seasons: ("spring" | "summer" | "fall" | "winter")[];
  occasions: ("casual" | "formal" | "sport" | "travel")[];
  status: "active" | "archived";
  frequencyWorn?: string;
  tags?: string[];
  category: string;
  color: string;
  season: string;
  createdAt: string;
  updatedAt: string;
}
```

#### **ApiWardrobeItem** (Backend response)
```typescript
{
  id?: number;
  userId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  aiDescription: string;
  brand?: string;
  imgUrl: string;
  weatherSuitable: string;
  condition: string;
  pattern: string;
  fabric: string;
  tag?: string;
  frequencyWorn?: string;
  lastWornAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

**Transform:** `apiItemToWardrobeItem()` in `wardrobe-store.ts` converts API format to frontend format.

---

### 🔑 Biến môi trường cần thiết

**`.env.local`** (không có trong repo):
```bash
# API Backend
NEXT_PUBLIC_API_BASE_URL=https://sop.wizlab.io.vn/api

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Environment
NODE_ENV=development
```

**Image Domains** (configured in `next.config.ts`):
```typescript
remotePatterns: [
  { hostname: 'storage.wizlab.io.vn', pathname: '/sop/**' },
  { hostname: 'sop.wizlab.io.vn', pathname: '/**' }
]
```

---

## 4. BUILD & CHẠY

### 📦 Package Manager
**npm** (có `package-lock.json`)

**Node version:** 20+ (recommended)

### 🚀 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server với Turbopack (http://localhost:3000) |
| `npm run build` | Production build với Turbopack |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run stagewise` | Start Stagewise server (port 3100) |

### 🔧 Setup để chạy dev

1. **Clone repo**
```bash
git clone <repo-url>
cd sop-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Tạo `.env.local`**
```bash
NEXT_PUBLIC_API_BASE_URL=https://sop.wizlab.io.vn/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
```

4. **Run dev server**
```bash
npm run dev
```

5. **Access app**
- **User portal**: http://localhost:3000
- **Admin portal**: http://localhost:3000/admin/login
- **Stagewise**: http://localhost:3100 (nếu chạy `npm run stagewise`)

### ⚙️ ESLint Config (`eslint.config.mjs`)
- **Extends:** `next/core-web-vitals`, `next/typescript`
- **Flat config format** (ESLint 9)
- **Ignores:** `node_modules`, `.next`, `out`, `build`
- **Rules:** Mostly Next.js defaults

### 🎨 Prettier
**Không có Prettier config** → Có thể thêm nếu cần consistency

### 🧪 Testing
**Không có test framework** → Cần setup (Jest + React Testing Library)

---

## 5. NỢ KỸ THUẬT / ISSUE

### ⚠️ TODO/FIXME trong code

#### **1. Wardrobe Store** (`src/store/wardrobe-store.ts`)
```typescript
// Line 132-137
case "most-worn":
  // TODO: Implement when we have wear tracking
  return sortedItems; 

case "least-worn":
  // TODO: Implement when we have wear tracking
  return sortedItems;
```
**Impact:** Sort by wear frequency không hoạt động

---

#### **2. Item Grid** (`src/components/wardrobe/item-grid.tsx`)
```typescript
// Line 79-80
// TODO: Implement default edit functionality
console.log("Edit item:", item);

// Line 88-89
// TODO: Implement default use in outfit functionality
console.log("Use in outfit:", item);
```
**Impact:** Edit & use in outfit chỉ log ra console, chưa có UI

---

### 🐛 Code Smells & Anti-patterns

#### **1. Duplicate Admin Routes**
- **Problem:** Có cả `src/app/(admin)/` VÀ `src/app/admin/` cùng tồn tại
- **Impact:** Confusion, duplicate code
- **Fix:** Migrate all admin routes to `(admin)` group, delete `admin/`

#### **2. Mixed API Response Handling**
```typescript
// wardrobe-api.ts line 108-121
const apiData = response.data.data;
let items: ApiWardrobeItem[] = [];
if (apiData && typeof apiData === "object") {
  if (apiData.data && Array.isArray(apiData.data)) {
    items = apiData.data; // Paginated response
  } else if (Array.isArray(apiData)) {
    items = apiData; // Direct array
  }
}
```
**Problem:** API response format không consistent
**Impact:** Defensive coding, hard to maintain
**Fix:** Standardize API response format

#### **3. String Body for Refresh Token**
```typescript
// auth-api.ts line 99
const response = await apiClient.post(
  `${this.BASE_PATH}/login/google/oauth`,
  JSON.stringify(credential), // ← String body, not object!
  { headers: { "Content-Type": "application/json" } }
);
```
**Problem:** API expect raw string, không phải JSON object
**Impact:** Confusing, không follow REST convention
**Fix:** Backend should accept `{ credential: string }`

#### **4. No Error Boundary**
**Problem:** React errors crash toàn bộ app
**Impact:** Bad UX
**Fix:** Add Error Boundary component

#### **5. No Loading States for Images**
**Problem:** Ảnh load chậm không có skeleton/placeholder
**Impact:** Layout shift, bad UX
**Fix:** Add loading skeleton cho ItemCard

---

### 🚨 Console Warnings/Errors phổ biến

#### **1. Hydration Mismatch**
```
Warning: Prop `className` did not match. 
Server: "..." Client: "..."
```
**Cause:** Server/client render khác nhau (thường do animations, random values)
**Fix:** Use `suppressHydrationWarning` hoặc `useEffect` cho client-only code

#### **2. Missing Environment Variables**
```
Missing NEXT_PUBLIC_API_BASE_URL environment variable.
Please add it to your .env.local file.
```
**Cause:** Chưa tạo `.env.local`
**Fix:** Add `.env.example` file trong repo

#### **3. Image Optimization Errors**
```
Invalid src prop (https://...) on `next/image`, hostname "..." is not configured under images in your `next.config.js`
```
**Cause:** Image từ domain chưa được config
**Fix:** Add domain vào `next.config.ts` remotePatterns

---

### ⚡ Performance Risks

#### **1. Large Bundle Size**
**Issue:** 
- Framer Motion + GSAP + Lenis + InteractJS trong cùng bundle
- Recharts (cho charts) cũng heavy

**Impact:** Slow initial page load
**Fix:** 
- Dynamic import animations chỉ khi cần
- Code splitting cho admin routes

#### **2. No Image Optimization in Production**
```typescript
// next.config.ts line 21
unoptimized: process.env.NODE_ENV === 'development',
```
**Problem:** Ảnh không optimize trong dev, nhưng có optimize trong production
**Impact:** Dev/prod behavior khác nhau
**Fix:** Remove hoặc optimize cả dev

#### **3. Fuse.js Search on Large Datasets**
**Problem:** Client-side search có thể chậm với 1000+ items
**Impact:** UI lag khi type search
**Fix:** Debounce search + consider server-side search

#### **4. No Pagination**
**Problem:** Load toàn bộ wardrobe items 1 lần
**Impact:** Slow với users có nhiều items
**Fix:** Implement infinite scroll hoặc pagination

---

### ♿ Accessibility Issues

#### **1. No Focus Management in Modals**
**Problem:** Open dialog không auto-focus input
**Impact:** Keyboard navigation khó khăn
**Fix:** Use Radix UI's `autoFocus` prop

#### **2. Missing Alt Text**
**Problem:** Một số images không có alt text
**Impact:** Screen reader không thể đọc
**Fix:** Require alt text trong ImageUpload component

#### **3. Color Contrast**
**Problem:** Một số text trên glass background có contrast thấp
**Impact:** Khó đọc cho người kém thị lực
**Fix:** Test với WCAG contrast checker

---

### 🌍 Internationalization

**Problem:** Hardcoded Vietnamese + English text
**Impact:** Không thể switch ngôn ngữ
**Fix:** Add i18n library (next-intl, react-i18next)

---

## 6. BACKLOG GỢI Ý

### 🏆 Ưu tiên cao (Phải làm)

#### **A. Nền tảng / Chạy dev**

1. **✅ Tạo `.env.example` file**
   - Impact: ⭐⭐⭐⭐⭐
   - Effort: 5 min
   - Lý do: Onboarding mới không biết env vars cần gì
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://sop.wizlab.io.vn/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=
   ```

2. **✅ Add README.md**
   - Impact: ⭐⭐⭐⭐⭐
   - Effort: 30 min
   - Nội dung: Setup instructions, tech stack, folder structure
   - Link đến PROJECT_BRIEF.md này

3. **🔧 Fix duplicate admin routes**
   - Impact: ⭐⭐⭐⭐
   - Effort: 2h
   - Migrate `src/app/admin/*` → `src/app/(admin)/*`
   - Update all links và redirects

4. **🧪 Setup testing framework**
   - Impact: ⭐⭐⭐⭐
   - Effort: 4h
   - Add Jest + React Testing Library
   - Write tests cho auth flow, wardrobe CRUD

---

#### **B. Chất lượng UI/UX**

5. **🎨 Add Error Boundary**
   - Impact: ⭐⭐⭐⭐⭐
   - Effort: 1h
   - Wrap app trong ErrorBoundary component
   - Show friendly error page thay vì white screen

6. **⏳ Add loading skeletons**
   - Impact: ⭐⭐⭐⭐
   - Effort: 2h
   - ItemCard skeleton loading state
   - Wardrobe page skeleton khi fetch data
   - Reduce layout shift

7. **🔍 Implement wear tracking**
   - Impact: ⭐⭐⭐
   - Effort: 8h
   - Backend: Add `timesWorn`, `lastWornAt` tracking
   - Frontend: Implement "Mark as worn today" button
   - Enable sort by most/least worn

8. **✏️ Implement edit item functionality**
   - Impact: ⭐⭐⭐⭐
   - Effort: 6h
   - Reuse AddItemWizard cho edit mode
   - Pre-fill form với existing data
   - PATCH `/items/{id}` on submit

9. **👗 Implement "Use in Outfit" feature**
   - Impact: ⭐⭐⭐
   - Effort: 16h+ (new feature)
   - Design outfit builder UI
   - API: Create outfit schema, endpoints
   - Drag-and-drop outfit builder

10. **🌐 Add i18n support**
    - Impact: ⭐⭐⭐
    - Effort: 8h
    - Add next-intl
    - Extract all strings to translation files
    - Language switcher component

---

#### **C. Kiến trúc FE**

11. **📦 Code splitting**
    - Impact: ⭐⭐⭐⭐
    - Effort: 3h
    - Dynamic import cho Framer Motion, GSAP
    - Lazy load admin routes
    - Analyze bundle với `@next/bundle-analyzer`

12. **🔄 Standardize API response format**
    - Impact: ⭐⭐⭐⭐
    - Effort: Depends on backend (2h frontend, 4h backend)
    - All endpoints return `{ statusCode, message, data }`
    - Remove defensive response parsing

13. **🗄️ Move to React Query completely**
    - Impact: ⭐⭐⭐
    - Effort: 6h
    - Migrate auth store to React Query
    - Remove duplicate state trong Zustand
    - Centralize cache invalidation

---

#### **D. Performance**

14. **♾️ Implement pagination/infinite scroll**
    - Impact: ⭐⭐⭐⭐⭐
    - Effort: 8h (backend + frontend)
    - Backend: Add pagination to `/items/user/{userId}`
    - Frontend: Infinite scroll với TanStack Query `useInfiniteQuery`
    - Limit initial load to 20-50 items

15. **🖼️ Optimize images**
    - Impact: ⭐⭐⭐⭐
    - Effort: 3h
    - Enable image optimization in dev
    - Use `priority` prop cho above-fold images
    - Add blur placeholder cho user uploads

16. **⚡ Debounce search input**
    - Impact: ⭐⭐⭐
    - Effort: 30 min
    - Add debounce (300ms) cho search query
    - Prevent excessive Fuse.js re-runs

---

#### **E. Testing & QA**

17. **🧪 Write E2E tests**
    - Impact: ⭐⭐⭐⭐
    - Effort: 12h
    - Setup Playwright or Cypress
    - Test flows: Login → Add item → Filter → Delete
    - Admin flow: Login → Manage users

18. **♿ Accessibility audit**
    - Impact: ⭐⭐⭐
    - Effort: 4h
    - Run Lighthouse accessibility scan
    - Fix missing alt texts, focus states
    - Test keyboard navigation

19. **📱 Mobile responsive check**
    - Impact: ⭐⭐⭐⭐
    - Effort: 6h
    - Test all pages on mobile
    - Fix overflow issues, touch targets
    - Optimize glass effects cho mobile performance

---

### 📊 Priority Matrix

```
High Impact, Low Effort (DO FIRST):
- ✅ .env.example (5 min)
- ✅ README.md (30 min)
- ⏳ Loading skeletons (2h)
- ⚡ Debounce search (30 min)

High Impact, High Effort (PLAN):
- 🐛 Error Boundary (1h)
- 🔧 Fix duplicate routes (2h)
- 📦 Code splitting (3h)
- ♾️ Pagination (8h)
- 🧪 Setup tests (4h)

Low Impact (BACKLOG):
- 🌐 i18n (8h)
- 👗 Outfit builder (16h+)
```

---

## 📝 Final Notes

### Điểm mạnh của codebase:
- ✅ Modern tech stack (Next.js 15, React 19, Turbopack)
- ✅ Clean folder structure (feature-based)
- ✅ Good state management (Zustand + TanStack Query)
- ✅ Type-safe với TypeScript strict mode
- ✅ Beautiful UI với glass effects, animations
- ✅ AI-powered features (image analysis)

### Điểm cần cải thiện:
- ⚠️ Thiếu tests
- ⚠️ Performance issues với large datasets
- ⚠️ Accessibility cần improve
- ⚠️ No i18n support
- ⚠️ Duplicate admin routes
- ⚠️ Missing error boundaries

### Roadmap suggestions:
1. **Phase 1 (2 weeks)**: Fix critical issues (tests, error handling, pagination)
2. **Phase 2 (4 weeks)**: Complete missing features (edit, wear tracking, outfit builder)
3. **Phase 3 (2 weeks)**: Polish (i18n, a11y, mobile optimization)

---

**Last Updated:** 2025-10-29  
**Document Owner:** AI Assistant  
**Next Review:** Khi có major changes trong tech stack hoặc architecture

