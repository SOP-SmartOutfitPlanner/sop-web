# Category Management - Advanced Features

## 🎯 Overview của các tính năng nâng cao

---

## 1. 🎨 **Drag & Drop Reordering**

### Mô tả:
Cho phép kéo thả categories để:
- Sắp xếp lại thứ tự categories
- Thay đổi parent category bằng cách kéo vào category khác
- Thay đổi level (parent → child hoặc ngược lại)

### Use Cases:

#### **Reorder siblings:**
```
Before:
├── Tops
│   ├── T-Shirts
│   ├── Shirts      ← Drag this
│   └── Sweaters

After (Drag Shirts to top):
├── Tops
│   ├── Shirts      ← Now first
│   ├── T-Shirts
│   └── Sweaters
```

#### **Change parent:**
```
Before:
├── Tops
│   └── T-Shirts
├── Bottoms
    └── Jeans       ← Drag this to Tops

After:
├── Tops
│   ├── T-Shirts
│   └── Jeans       ← Moved here
├── Bottoms
```

#### **Promote to parent:**
```
Before:
├── Clothing
│   └── Shirts      ← Drag out

After:
├── Clothing
├── Shirts          ← Now parent
```

### Implementation:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';

function CategoryItem({ category }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {category.name}
    </div>
  );
}
```

### Benefits:
- ✅ Intuitive UX
- ✅ Visual feedback
- ✅ No need for "Move Up/Down" buttons
- ✅ Faster reorganization

---

## 2. 📦 **Bulk Operations**

### Mô tả:
Thao tác với nhiều categories cùng lúc thay vì từng cái một.

### Features:

#### **A. Multi-Select Categories**
```
UI:
☑️ Tops (selected)
☑️ Bottoms (selected)
☐ Outerwear
☑️ Footwear (selected)

Actions:
[Delete Selected] [Move to...] [Export] [Tag]
```

#### **B. Bulk Delete**
```tsx
Example:
- Select: "Summer", "Winter", "Spring"
- Click "Delete Selected (3)"
- Confirm dialog
- Delete all at once

API Call:
DELETE /categories/bulk
Body: { ids: [33, 34, 36] }
```

#### **C. Bulk Move (Change Parent)**
```tsx
Example:
- Select: "T-Shirts", "Shirts", "Sweaters"
- Click "Move to..."
- Select new parent: "Tops"
- All 3 categories moved

API Call:
PATCH /categories/bulk/move
Body: { 
  ids: [7, 8, 9],
  parentId: 1 
}
```

#### **D. Bulk Tag/Label**
```tsx
Example:
- Select multiple categories
- Add tags: "seasonal", "popular"
- All selected categories get tagged

Use case: Filter/search by tags later
```

#### **E. Bulk Export**
```tsx
Example:
- Select: All color categories
- Click "Export"
- Download as:
  - JSON
  - CSV
  - Excel

Output (CSV):
id,name,parentId,parentName
43,Black,32,Color
44,White,32,Color
45,Navy,32,Color
```

### Implementation:

```tsx
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

// Select/Deselect
const toggleSelect = (id: number) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedIds(newSelected);
};

// Bulk delete
const bulkDelete = async () => {
  await Promise.all(
    Array.from(selectedIds).map(id => adminAPI.deleteCategory(id))
  );
  toast.success(`Deleted ${selectedIds.size} categories`);
  setSelectedIds(new Set());
};
```

### UI Components:

```tsx
// Selection toolbar
{selectedIds.size > 0 && (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-4">
    <span className="mr-4">{selectedIds.size} selected</span>
    <Button onClick={bulkDelete} variant="destructive">
      Delete Selected
    </Button>
    <Button onClick={bulkMove}>
      Move to...
    </Button>
    <Button onClick={bulkExport}>
      Export
    </Button>
  </div>
)}
```

### Benefits:
- ✅ Save time với large datasets
- ✅ Consistent operations
- ✅ Better for data migration
- ✅ Bulk import/export

---

## 3. 🖼️ **Category Images/Icons**

### Mô tả:
Thêm visual representation cho mỗi category.

### Types:

#### **A. Icon Selection**
```tsx
// Icon library
import { Shirt, ShoppingBag, Footprints, Sun, Snowflake } from 'lucide-react';

Category Icons:
- Tops: 👕 Shirt
- Bottoms: 👖 Trousers
- Footwear: 👟 Footprints
- Summer: ☀️ Sun
- Winter: ❄️ Snowflake
- Accessories: 👜 Bag
```

#### **B. Image Upload**
```tsx
Example:
- Upload image cho "Summer" category
- Show image trong category card
- Use in filters/navigation

Storage:
/uploads/categories/
  ├── summer.jpg
  ├── winter.jpg
  └── formal.jpg

Database:
{
  id: 34,
  name: "Summer",
  imageUrl: "/uploads/categories/summer.jpg",
  iconName: "sun"
}
```

#### **C. Color Coding**
```tsx
// Assign colors to categories
const categoryColors = {
  Season: '#3B82F6',      // Blue
  Occasion: '#8B5CF6',    // Purple
  Color: '#10B981',       // Green
  Tops: '#F59E0B',        // Orange
  Bottoms: '#EF4444',     // Red
};

// Display with colored badges
<Badge style={{ backgroundColor: categoryColors[category.parentName] }}>
  {category.name}
</Badge>
```

### Implementation:

```tsx
// Image upload component
import { useDropzone } from 'react-dropzone';

function CategoryImageUpload({ categoryId, onUpload }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: 2097152, // 2MB
    onDrop: async (files) => {
      const formData = new FormData();
      formData.append('image', files[0]);
      
      const response = await fetch(`/api/categories/${categoryId}/image`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      onUpload(data.imageUrl);
    },
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-4 cursor-pointer">
      <input {...getInputProps()} />
      <p>Drag image here or click to upload</p>
    </div>
  );
}
```

### Display in UI:

```tsx
// Category card with image
<div className="category-card">
  {category.imageUrl ? (
    <img src={category.imageUrl} alt={category.name} className="w-16 h-16 rounded" />
  ) : (
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
      <Shirt className="w-8 h-8" />
    </div>
  )}
  <span>{category.name}</span>
</div>
```

### Benefits:
- ✅ Better visual navigation
- ✅ Easier to identify categories
- ✅ More appealing UI
- ✅ Better UX cho end users

---

## 4. 🔍 **Advanced Search & Filter**

### Features:

#### **A. Multi-field Search**
```tsx
Search by:
- Name: "Black"
- Parent: "Color"
- ID: 43
- Tags: "popular"

<Input 
  placeholder="Search by name, parent, or tags..."
  onChange={handleSearch}
/>
```

#### **B. Filter by Parent**
```tsx
<Select>
  <SelectItem value="all">All Categories</SelectItem>
  <SelectItem value="1">Tops only</SelectItem>
  <SelectItem value="2">Bottoms only</SelectItem>
  <SelectItem value="4">Footwear only</SelectItem>
</Select>
```

#### **C. Filter by Usage**
```tsx
Filters:
- Show only used categories (has items)
- Show unused categories (no items)
- Most used categories
- Least used categories

Example:
"Black" - Used in 1,234 items
"Navy" - Used in 856 items
"Purple" - Used in 45 items
"Orange" - Not used (0 items)
```

#### **D. Advanced Filters**
```tsx
Combine filters:
- Parent: "Color"
- Status: "Active"
- Usage: "Has items"
- Sort by: "Most used"

Result: Show active color categories with items, sorted by usage
```

### Implementation:

```tsx
const [filters, setFilters] = useState({
  search: '',
  parentId: null,
  minUsage: 0,
  sortBy: 'name',
});

const filteredCategories = categories
  .filter(cat => 
    cat.name.toLowerCase().includes(filters.search.toLowerCase())
  )
  .filter(cat => 
    !filters.parentId || cat.parentId === filters.parentId
  )
  .filter(cat => 
    cat.itemCount >= filters.minUsage
  )
  .sort((a, b) => {
    if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
    if (filters.sortBy === 'usage') return b.itemCount - a.itemCount;
    return 0;
  });
```

---

## 5. 📊 **Usage Statistics**

### Features:

#### **A. Item Count per Category**
```tsx
Display:
├── Tops (3,245 items)
│   ├── T-Shirts (1,543 items)
│   ├── Shirts (1,234 items)
│   └── Sweaters (468 items)
├── Bottoms (2,876 items)
│   ├── Jeans (1,456 items)
│   ├── Trousers (892 items)
│   ├── Skirts (345 items)
│   └── Shorts (183 items)

API:
GET /categories/stats
Response:
{
  categoryId: 1,
  name: "Tops",
  itemCount: 3245,
  children: [...]
}
```

#### **B. Most/Least Used Categories**
```tsx
Most Used:
1. Black (1,234 items) ████████████████░░ 45%
2. Navy (856 items)   ████████████░░░░░░ 31%
3. White (723 items)  ██████████░░░░░░░░ 26%

Least Used:
1. Purple (45 items)
2. Yellow (32 items)
3. Pink (28 items)

Unused:
- Orange (0 items) ⚠️
- Beige (0 items) ⚠️
```

#### **C. Category Trends**
```tsx
// Chart showing usage over time
Line Chart:
- X-axis: Months
- Y-axis: Item count
- Lines: Different categories

"Black" category usage:
Jan: 800 items
Feb: 950 items
Mar: 1,100 items
Apr: 1,234 items (current)
```

#### **D. Recommendations**
```tsx
Insights:
✓ "Black" is most popular - consider adding more variations
⚠️ "Orange" has 0 items - consider removing
✓ "Casual" occasion is trending up
⚠️ "Formal" usage declining
```

---

## 6. 🏷️ **Category Tags & Metadata**

### Features:

#### **A. Custom Tags**
```tsx
Category: "Summer"
Tags: [seasonal, popular, outdoor, vacation]

Category: "Formal"
Tags: [work, professional, elegant]

Category: "Black"
Tags: [versatile, classic, basic]
```

#### **B. Metadata Fields**
```tsx
Category: "Summer"
{
  name: "Summer",
  description: "Lightweight, breathable clothing for hot weather",
  seasonStart: "June",
  seasonEnd: "August",
  recommendedFor: ["Beach", "Outdoor", "Casual"],
  color: "#FFA500",
  icon: "sun",
  popularity: 95,
  trending: true
}
```

#### **C. SEO Fields**
```tsx
For public-facing category pages:
{
  metaTitle: "Summer Clothing Collection | SOP",
  metaDescription: "Browse our summer collection...",
  metaKeywords: ["summer", "lightweight", "beach"],
  slug: "summer-collection"
}
```

---

## 7. 📋 **Category Templates**

### Features:

#### **A. Preset Templates**
```tsx
Template: "Fashion Wardrobe"
Creates:
├── Tops
│   ├── T-Shirts
│   ├── Shirts
│   └── Sweaters
├── Bottoms
│   ├── Jeans
│   ├── Trousers
│   └── Skirts
└── Footwear
    ├── Sneakers
    └── Boots

Template: "Color Palette"
Creates:
└── Colors
    ├── Black
    ├── White
    ├── Navy
    └── Gray
```

#### **B. Import/Export Templates**
```tsx
Export current structure:
Download: category-structure.json

Import structure:
Upload: category-structure.json
→ Recreates entire category tree
```

---

## 8. 🔗 **Category Relationships**

### Features:

#### **A. Related Categories**
```tsx
Category: "Summer"
Related to:
- "Casual" (occasion)
- "Beach" (location)
- "Lightweight" (material)
- "Bright Colors" (color style)
```

#### **B. Category Suggestions**
```tsx
When user adds "T-Shirt":
Suggest also tagging:
- "Tops" ✓
- "Casual" ?
- "Summer" ?
- "Cotton" ?
```

#### **C. Auto-tagging**
```tsx
AI-powered:
Upload image → Detect:
- Type: "Dress"
- Color: "Red"
- Occasion: "Formal"
- Season: "Summer"

Auto-suggest these categories
```

---

## 9. 📱 **Category Preview**

### Features:

#### **A. Item Preview**
```tsx
Hover over category → Show:
- First 4 items in this category
- Total item count
- Quick stats

Example:
Hover "Black" →
[img] [img] [img] [img]
+ 1,230 more items
```

#### **B. Category Page Preview**
```tsx
Click "Preview" →
See how category will look to end users:
- Banner image
- Description
- Items grid
- Filters
```

---

## 10. 🔄 **Version History**

### Features:

#### **A. Change Tracking**
```tsx
History:
- 2024-10-18 10:30 - Created "Summer" by Admin
- 2024-10-18 11:45 - Renamed to "Summer Collection"
- 2024-10-18 14:20 - Moved under "Season"
- 2024-10-19 09:15 - Added description
```

#### **B. Rollback**
```tsx
Revert to previous version:
- Click version in history
- Preview changes
- Confirm rollback
```

---

## 📊 Priority Recommendations

### Must Have (P0):
1. ✅ **Drag & Drop** - Best UX improvement
2. ✅ **Bulk Operations** - Time saver
3. ✅ **Usage Statistics** - Business insights

### Should Have (P1):
4. **Advanced Search** - Better navigation
5. **Category Images** - Visual improvement
6. **Tags & Metadata** - More flexible

### Nice to Have (P2):
7. **Templates** - Quick setup
8. **Relationships** - Smart suggestions
9. **Preview** - Better validation
10. **Version History** - Safety net

---

## 🎯 Implementation Order

### Phase 1 (Week 1):
- Bulk Select & Delete
- Basic Search
- Usage Statistics

### Phase 2 (Week 2):
- Drag & Drop
- Category Images
- Advanced Filters

### Phase 3 (Week 3):
- Tags & Metadata
- Templates
- Category Relationships

### Phase 4 (Week 4):
- Preview
- Version History
- Polish & Testing

---

## 💡 Technical Stack

```json
{
  "Drag & Drop": "@dnd-kit/core",
  "File Upload": "react-dropzone",
  "Export": "xlsx, papaparse",
  "Search": "fuse.js",
  "Charts": "recharts",
  "Image Processing": "sharp (backend)"
}
```

---

## 🔥 Business Value

### Time Savings:
- Bulk operations: **70% faster** than one-by-one
- Drag & drop: **50% faster** than edit dialogs
- Search: **80% faster** finding categories

### User Experience:
- Visual categories: **60% better** recognition
- Usage stats: **Data-driven** decisions
- Templates: **90% faster** initial setup

### Maintenance:
- Version history: **100% safer** changes
- Unused detection: **Clean up** database
- Auto-suggestions: **Fewer errors**

---

Tất cả các features này sẽ biến Category Management từ basic CRUD thành một **powerful, user-friendly system**! 🚀

