# Admin Portal - Recommended Libraries

## 📊 1. Data Visualization & Charts

### Recharts (Recommended)
```bash
npm install recharts
```
**Pros:**
- React-native, dễ integrate với React
- Responsive & customizable
- Support đầy đủ chart types
- Good documentation

**Use cases:**
- Dashboard analytics
- User growth charts
- Revenue charts
- Activity charts

**Example:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="users" stroke="#8884d8" />
</LineChart>
```

### Alternatives:
- **Chart.js + react-chartjs-2**: More features, heavier
- **Victory**: More customizable
- **Nivo**: Beautiful, modern design

---

## 📋 2. Advanced Data Tables

### TanStack Table v8 (Recommended)
```bash
npm install @tanstack/react-table
```
**Pros:**
- Headless UI - full control
- Powerful features: sorting, filtering, pagination, grouping
- Type-safe with TypeScript
- Excellent performance

**Use cases:**
- User management tables
- Item management tables
- Transaction tables
- Any complex data tables

**Example:**
```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});
```

### Alternatives:
- **AG Grid**: Enterprise features, paid license
- **Material React Table**: Built on TanStack Table + Material UI

---

## 📅 3. Date & Time Management

### date-fns (Recommended)
```bash
npm install date-fns
```
**Pros:**
- Modular, tree-shakeable
- Modern, immutable
- TypeScript support
- Lightweight

**Use cases:**
- Format dates
- Date calculations
- Relative time
- Time zones

**Example:**
```tsx
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

format(new Date(), 'dd/MM/yyyy', { locale: vi });
formatDistanceToNow(new Date(user.createdDate), { addSuffix: true, locale: vi });
```

### For Date Pickers:
```bash
npm install react-day-picker date-fns
```

### Alternatives:
- **dayjs**: Smaller, similar API to moment.js
- **luxon**: Modern, timezone-aware

---

## 📤 4. File Upload & Management

### react-dropzone (Recommended)
```bash
npm install react-dropzone
```
**Pros:**
- Drag & drop support
- File validation
- Easy to use
- Customizable

**Use cases:**
- Avatar uploads
- Document uploads
- Bulk image uploads
- CSV imports

**Example:**
```tsx
import { useDropzone } from 'react-dropzone';

const { getRootProps, getInputProps } = useDropzone({
  accept: {'image/*': []},
  maxSize: 5242880, // 5MB
  onDrop: (files) => handleUpload(files),
});
```

### Alternatives:
- **react-uploady**: More features
- **filepond**: Beautiful UI, heavy

---

## 📊 5. Export Data (CSV, Excel)

### xlsx (Recommended)
```bash
npm install xlsx
```
**Pros:**
- Full Excel support (.xlsx, .xls)
- Read & write
- Fast performance

**Use cases:**
- Export user lists
- Export reports
- Export analytics

**Example:**
```tsx
import * as XLSX from 'xlsx';

const exportToExcel = (data, filename) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
```

### For CSV only:
```bash
npm install papaparse
```

---

## ✍️ 6. Rich Text Editor

### Tiptap (Recommended)
```bash
npm install @tiptap/react @tiptap/starter-kit
```
**Pros:**
- Modern, extensible
- Headless - full styling control
- TypeScript support
- Markdown support

**Use cases:**
- Blog post editor
- Email templates
- Content management
- Announcements

**Example:**
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello World!</p>',
});
```

### Alternatives:
- **React Quill**: Simpler, Quill-based
- **Slate**: More control, steeper learning curve

---

## 📊 7. Analytics & Tracking

### Mixpanel / PostHog
```bash
npm install mixpanel-browser
# or
npm install posthog-js
```

**Use cases:**
- Track admin actions
- Monitor performance
- User behavior analytics

---

## 🎨 8. Additional UI Components

### Sonner (Already installed) ✅
Toast notifications - great choice!

### react-hot-toast
Alternative toast library

### cmdk
```bash
npm install cmdk
```
Command palette (Cmd+K) - great for admin!

### vaul
```bash
npm install vaul
```
Beautiful drawers - for mobile-friendly admin

---

## 🔐 9. Form Validation & Management

### React Hook Form + Zod (Already installed) ✅
Perfect combination!

### Additional:
```bash
npm install react-hook-form-persist
```
Form state persistence

---

## 🎯 10. State Management (Already good!)

### Zustand (Already installed) ✅
### React Query (Already installed) ✅

---

## 🔍 11. Search & Filter

### fuse.js
```bash
npm install fuse.js
```
**Pros:**
- Fuzzy search
- Fast, lightweight
- No backend needed for simple searches

---

## 📱 12. Responsive Tables

### react-table-sticky
```bash
npm install react-table-sticky
```
Sticky headers & columns for tables

---

## 🖼️ 13. Image Optimization (Already have Next.js Image!)

### react-image-crop
```bash
npm install react-image-crop
```
For avatar cropping

---

## 🌍 14. Internationalization (i18n)

### next-intl
```bash
npm install next-intl
```
For multi-language admin

---

## 🎭 15. Animation

### framer-motion
```bash
npm install framer-motion
```
Smooth animations for better UX

---

## 📦 Priority Installation (Top 5 cho Admin)

```bash
# 1. Charts & visualization
npm install recharts

# 2. Advanced tables
npm install @tanstack/react-table

# 3. Date handling
npm install date-fns

# 4. File uploads
npm install react-dropzone

# 5. Export functionality
npm install xlsx
```

---

## 🎯 Recommended Stack cho SOP Admin:

```json
{
  "dependencies": {
    // Data Visualization
    "recharts": "^2.10.0",
    
    // Advanced Tables
    "@tanstack/react-table": "^8.11.0",
    
    // Date & Time
    "date-fns": "^3.0.0",
    "react-day-picker": "^8.10.0",
    
    // File Upload
    "react-dropzone": "^14.2.0",
    
    // Export
    "xlsx": "^0.18.5",
    
    // Rich Text (optional)
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    
    // Command Palette
    "cmdk": "^0.2.0",
    
    // Search
    "fuse.js": "^7.0.0",
    
    // Animation
    "framer-motion": "^10.16.0"
  }
}
```

---

## 🔥 Nice-to-have Libraries:

1. **react-pdf** - PDF preview/generation
2. **qrcode.react** - QR code generation
3. **react-color** - Color picker
4. **react-markdown** - Markdown preview
5. **react-syntax-highlighter** - Code display
6. **recharts-to-png** - Export charts as images

---

## ⚡ Performance Tips:

1. Use **dynamic imports** for heavy libraries
2. Code-split admin routes
3. Lazy load charts
4. Use **virtual scrolling** for large tables (react-window)
5. Optimize images with Next.js Image

---

## 🎨 Design System:

Current: **Shadcn UI** ✅ - Excellent choice!

Benefits:
- Copy-paste components
- Full customization
- TypeScript support
- Tailwind CSS
- Radix UI primitives

Keep using it!

