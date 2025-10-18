# Category Management Guide

## 📋 Overview

Category Management System cho phép quản lý hierarchical categories (parent-child structure) trong admin portal.

---

## 🏗️ Architecture

### Category Structure:

```
Parent Categories (no parentId)
├── Season
│   ├── Spring
│   ├── Summer
│   ├── Autumn
│   └── Winter
├── Occasion
│   ├── Casual
│   ├── Work
│   ├── Formal
│   ├── Party
│   ├── Date
│   └── Sport
├── Color
│   ├── Black
│   ├── White
│   ├── Navy
│   ├── Beige
│   ├── Gray
│   ├── Blue
│   ├── Brown
│   ├── Green
│   ├── Red
│   ├── Pink
│   ├── Yellow
│   └── Purple
├── Tops
│   ├── T-Shirts
│   ├── Shirts
│   └── Sweaters
├── Bottoms
│   ├── Jeans
│   ├── Trousers
│   ├── Skirts
│   └── Shorts
├── Outerwear
│   ├── Jackets
│   ├── Coats
│   ├── Blazers
│   └── Cardigans
├── Footwear
│   ├── Sneakers
│   ├── Boots
│   ├── Heels
│   ├── Loafers
│   └── Sandals
├── Accessories
│   ├── Bags
│   ├── Belts
│   ├── Hats
│   ├── Scarves
│   └── Jewelry
└── Dresses & Jumpsuits
    ├── Dresses
    └── Jumpsuits
```

---

## 🎯 Features Implemented

### 1. **Tree View Display**
- ✅ Hierarchical display của parent-child categories
- ✅ Expand/Collapse functionality
- ✅ Visual hierarchy với indentation
- ✅ Icon indicators (FolderTree)
- ✅ Child count badges

### 2. **CRUD Operations**

#### Create Category:
```tsx
- Tạo parent category (parentId = null)
- Tạo child category (chọn parent)
- Validation tên category
- Toast notifications
```

#### Update Category:
```tsx
- Edit tên category
- Thay đổi parent category
- Prevent circular dependencies
```

#### Delete Category:
```tsx
- Delete confirmation dialog
- Warning về subcategories
- Cascade delete (nếu có)
```

### 3. **Statistics Dashboard**
- Total Categories
- Parent Categories count
- Child Categories count
- Top Level categories

### 4. **Real-time Updates**
- React Query automatic cache invalidation
- Instant UI updates after mutations
- Optimistic updates

---

## 📊 API Integration

### Endpoints:

```typescript
// Get all categories
GET /api/v1/categories?page=1&page-size=100

// Get categories by parent
GET /api/v1/categories/parent/:parentId

// Create category
POST /api/v1/categories
Body: { name: string, parentId: number | null }

// Update category
PUT /api/v1/categories/:id
Body: { name: string, parentId: number | null }

// Delete category
DELETE /api/v1/categories/:id
```

### Response Format:

```json
{
  "statusCode": 200,
  "message": "Get list item successfully",
  "data": {
    "data": [
      {
        "id": 54,
        "name": "Purple",
        "parentId": 32,
        "parentName": "Color"
      }
    ],
    "metaData": {
      "totalCount": 54,
      "pageSize": 50,
      "currentPage": 1,
      "totalPages": 2,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

## 🎨 UI Components

### Tree View:
- **Expand/Collapse buttons**: ChevronRight/ChevronDown icons
- **Category icons**: FolderTree (blue for parents, gray for children)
- **Badges**: Show child count
- **Actions**: Edit & Delete buttons (visible on hover)

### Dialogs:
- **Create Dialog**: Name input + Parent selector
- **Edit Dialog**: Name input + Parent selector (exclude self)
- **Delete Dialog**: Confirmation with AlertDialog

### Stats Cards:
- Total Categories
- Parent Categories
- Child Categories
- Top Level Categories

---

## 🔄 State Management

### React Query Hooks:

```typescript
// Fetch all categories
useAdminCategories({ pageSize: 100 })

// Fetch by parent
useAdminCategoriesByParent(parentId, { pageSize: 10 })

// Create
useCreateCategory()

// Update
useUpdateCategory()

// Delete
useDeleteCategory()
```

### Local State:
- `expandedCategories`: Set<number> - Track expanded nodes
- `isCreateOpen`, `isEditOpen`, `isDeleteOpen`: Dialog states
- `selectedCategory`: Currently selected category for edit/delete
- `formName`, `formParentId`: Form inputs

---

## 💡 Best Practices

### 1. **Category Naming**
- ✅ Clear, descriptive names
- ✅ Consistent casing (Title Case)
- ✅ Singular or plural (be consistent)
- ✅ Avoid special characters

### 2. **Hierarchy Design**
- ✅ Maximum 2-3 levels deep
- ✅ Logical grouping
- ✅ Avoid too many subcategories

### 3. **Parent Categories**
- Should represent broad concepts:
  - Physical attributes (Color, Season)
  - Usage context (Occasion)
  - Garment types (Tops, Bottoms, etc.)

### 4. **Child Categories**
- Should be specific:
  - Colors: Black, White, Navy
  - Occasions: Casual, Work, Formal
  - Types: T-Shirts, Jeans, Sneakers

---

## 🚀 Usage Examples

### Creating a Parent Category:

```
1. Click "Thêm Category"
2. Enter name: "Material"
3. Select "None (Root Category)"
4. Click "Tạo"
```

### Creating a Child Category:

```
1. Click "Thêm Category"
2. Enter name: "Cotton"
3. Select parent: "Material"
4. Click "Tạo"
```

### Editing a Category:

```
1. Hover over category
2. Click Edit icon
3. Update name or parent
4. Click "Lưu"
```

### Deleting a Category:

```
1. Hover over category
2. Click Delete icon
3. Confirm deletion
```

---

## 🎯 Advanced Features (Future)

### 1. **Drag & Drop Reordering**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```
- Drag categories to reorder
- Drag to change parent

### 2. **Bulk Operations**
- Multi-select categories
- Bulk delete
- Bulk move to different parent

### 3. **Category Images**
- Upload icon/image for category
- Visual representation

### 4. **Category Attributes**
- Custom fields per category
- Metadata (description, color, etc.)

### 5. **Usage Statistics**
- Count items per category
- Most used categories
- Unused categories

### 6. **Search & Filter**
- Search categories by name
- Filter by parent
- Filter by usage

---

## 📝 Database Schema

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  parent_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_parent_id ON categories(parent_id);
CREATE INDEX idx_name ON categories(name);
```

---

## 🔐 Permissions

### Admin Only:
- ✅ Create categories
- ✅ Update categories
- ✅ Delete categories
- ✅ View all categories

### Regular Users:
- ✅ View categories (read-only)
- ❌ No CRUD operations

---

## 📊 Performance Optimization

### 1. **Pagination**
- Load categories in batches
- Default: 100 per page

### 2. **Caching**
- React Query cache: 1 minute
- Invalidate on mutations

### 3. **Lazy Loading**
- Load children on expand
- useAdminCategoriesByParent()

### 4. **Memoization**
- useMemo for tree building
- Prevent unnecessary re-renders

---

## 🐛 Troubleshooting

### Issue: Tree không hiển thị đúng
**Solution:** Check parentId relationships in data

### Issue: Delete không hoạt động
**Solution:** Check có children categories không (cascade delete)

### Issue: Slow performance
**Solution:** Increase pageSize hoặc implement lazy loading

---

## ✅ Testing Checklist

- [ ] Create parent category
- [ ] Create child category
- [ ] Edit category name
- [ ] Change parent category
- [ ] Delete category without children
- [ ] Delete category with children
- [ ] Expand/collapse categories
- [ ] Stats cards update correctly
- [ ] Toast notifications show
- [ ] Form validation works

---

## 📚 Related Documentation

- [Admin Libraries Guide](./ADMIN_LIBRARIES.md)
- [API Documentation](./API_DOCS.md)
- [User Guide](./USER_GUIDE.md)

---

## 🎉 Summary

Category Management System cung cấp:
- ✅ Hierarchical tree view
- ✅ Full CRUD operations
- ✅ Real-time updates
- ✅ User-friendly UI
- ✅ Type-safe with TypeScript
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Confirmation dialogs

Perfect cho việc quản lý categories trong SOP admin portal! 🚀

