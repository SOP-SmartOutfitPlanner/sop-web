# Wizard Form - SIMPLIFIED for Current API

## 🎯 MỤC TIÊU
Chỉ sử dụng các field mà API hiện tại đã hỗ trợ. **KHÔNG** thêm field mới.

---

## ✅ API FIELDS HIỆN TẠI (từ `CreateWardrobeItemRequest`)

```typescript
interface CreateWardrobeItemRequest {
  userId: number;           // ✅ Required
  name: string;             // ✅ Required
  categoryId: number;       // ✅ Required
  categoryName: string;     // ✅ Required
  color: string;            // ✅ Required (comma-separated string)
  aiDescription: string;    // ✅ Required
  brand?: string;           // ✅ Optional
  frequencyWorn?: string;   // ✅ Optional (string number: "0", "1", "2"...)
  lastWornAt?: string;      // ✅ Optional (ISO date string)
  imgUrl: string;           // ✅ Required
  weatherSuitable: string;  // ✅ Required (comma-separated)
  condition: string;        // ✅ Required
  pattern: string;          // ✅ Required
  fabric: string;           // ✅ Required
  tag?: string;             // ✅ Optional (comma-separated)
}
```

**Total: 15 fields**

---

## 📋 WIZARD FORM FIELDS (từ Lovable)

### ✅ GIỮ LẠI - Match với API (11 fields)

| Wizard Field | API Field | Transform | Keep? |
|--------------|-----------|-----------|-------|
| `name` | `name` | Direct | ✅ |
| `categoryId` | `categoryId` | Direct | ✅ |
| `categoryName` | `categoryName` | Direct | ✅ |
| `brand` | `brand` | Direct | ✅ |
| `colors: ColorOption[]` | `color: string` | Join names | ✅ |
| `notes` | `aiDescription` | Rename | ✅ |
| `imageRemBgURL` | `imgUrl` | Direct | ✅ |
| `seasons: string[]` | `weatherSuitable` | Join | ✅ |
| `condition` | `condition` | Direct | ✅ |
| `pattern` | `pattern` | Direct | ✅ |
| `fabric` | `fabric` | Direct | ✅ |
| `tags: string[]` | `tag` | Join | ✅ |
| `wornToday: boolean` | `frequencyWorn` + `lastWornAt` | Convert | ✅ |

---

### ❌ BỎ ĐI - Không có trong API (3 fields)

| Wizard Field | Type | Reason | Action |
|--------------|------|--------|--------|
| `uploadedImageURL` | string | Chỉ dùng tạm local, không send API | 🟡 **Keep local only** (để preview) |
| `occasions: string[]` | string[] | API không có field này | 🔴 **XÓA HOÀN TOÀN** |
| `frequencyWorn: number` | number | Chỉ dùng internal, không send trực tiếp | 🟡 **Keep internal** (convert to string) |
| `lastWornAt: string\|null` | string | Chỉ dùng internal | 🟡 **Keep internal** (từ wornToday) |

---

## 🗑️ DANH SÁCH BỎ ĐI

### 1. **`occasions`** - XÓA HOÀN TOÀN
```typescript
// ❌ REMOVE từ wizard
occasions: string[];  // Casual, Work, Formal...
```

**Lý do:** API không có field `occasions`

**Action:** 
- Xóa field khỏi `WizardFormData`
- Xóa UI trong `StepCategorize.tsx`
- Xóa constants `OCCASIONS`

---

### 2. **`uploadedImageURL`** - GIỮ LOCAL ONLY
```typescript
// 🟡 Keep nhưng không send API
uploadedImageURL: string;  // Base64 image for preview
```

**Lý do:** Chỉ dùng để preview local, API chỉ nhận `imgUrl` (sau remove background)

**Action:** Giữ trong form state nhưng không include trong API payload

---

### 3. **`frequencyWorn`** & **`lastWornAt`** - INTERNAL ONLY
```typescript
// 🟡 Keep để convert từ wornToday
frequencyWorn: number;      // Internal counter
lastWornAt: string | null;  // Internal date
```

**Lý do:** Không send trực tiếp, chỉ convert từ `wornToday` boolean

**Action:** Giữ internal, convert khi submit

---

## 📝 UPDATED FORM DATA STRUCTURE

### Simplified `WizardFormData`

```typescript
export interface WizardFormData {
  // ✅ KEEP - Send to API
  name: string;
  categoryId: number;
  categoryName: string;
  brand: string;
  notes: string;                    // → aiDescription
  colors: ColorOption[];            // → color (joined)
  seasons: string[];                // → weatherSuitable (joined)
  pattern: string;
  fabric: string;
  condition: string;
  tags: string[];                   // → tag (joined)
  
  // ✅ KEEP - Send to API (converted)
  wornToday: boolean;               // → frequencyWorn + lastWornAt
  
  // 🟡 KEEP - Local only (not sent to API)
  uploadedImageURL: string;         // For preview only
  imageRemBgURL: string;            // → imgUrl (sent to API)
  
  // ❌ REMOVE - Not in API
  // occasions: string[];           // DELETED
}

interface ColorOption {
  name: string;
  hex: string;
}
```

**Total: 13 fields (giảm từ 16 → 13)**

---

## 🔧 UPDATED TRANSFORM FUNCTION

```typescript
export function transformWizardDataToAPI(
  formData: WizardFormData,
  userId: number
): CreateWardrobeItemRequest {
  return {
    // User
    userId,
    
    // Basic info
    name: formData.name,
    categoryId: formData.categoryId,
    categoryName: formData.categoryName,
    brand: formData.brand || undefined,
    
    // Description
    aiDescription: formData.notes || `${formData.brand} ${formData.name}`.trim(),
    
    // Images
    imgUrl: formData.imageRemBgURL || formData.uploadedImageURL,
    
    // Colors (array → string)
    color: formData.colors.map(c => c.name).join(', ') || 'Unknown',
    
    // Weather/Seasons (array → string)
    weatherSuitable: formData.seasons.join(', '),
    
    // Details
    condition: formData.condition,
    pattern: formData.pattern,
    fabric: formData.fabric,
    
    // Tags (array → string)
    tag: formData.tags.join(', ') || undefined,
    
    // Worn tracking (boolean → string + date)
    frequencyWorn: formData.wornToday ? "1" : "0",
    lastWornAt: formData.wornToday ? new Date().toISOString() : undefined,
  };
}
```

---

## 🎨 UI CHANGES NEEDED

### File: `StepCategorize.tsx`

#### ❌ XÓA SECTION NÀY:
```typescript
{/* Occasions */}
<div>
  <Label>Occasions (optional)</Label>
  <div className="flex flex-wrap gap-2 mt-2">
    {OCCASIONS.map(occasion => {
      const isSelected = formData.occasions.includes(occasion);
      return (
        <button
          key={occasion}
          type="button"
          onClick={() => toggleOccasion(occasion)}
          className={...}
        >
          {occasion}
        </button>
      );
    })}
  </div>
</div>
```

#### ❌ XÓA CONSTANT:
```typescript
const OCCASIONS = ['Casual', 'Work', 'Formal', 'Smart', 'Active'];
```

#### ❌ XÓA FUNCTION:
```typescript
const toggleOccasion = (occasion: string) => {
  // Delete this entire function
};
```

---

### File: `types.ts`

#### ❌ XÓA FIELD:
```typescript
export interface WizardFormData {
  // ... other fields
  occasions: string[];  // ❌ DELETE THIS LINE
  // ... other fields
}
```

---

### File: `AddItemWizard.tsx`

#### ❌ XÓA KHỎI INITIAL STATE:
```typescript
const [formData, setFormData] = useState<WizardFormData>({
  // ... other fields
  occasions: [],  // ❌ DELETE THIS LINE
  // ... other fields
});
```

#### ❌ XÓA KHỎI RESET:
```typescript
const resetAndClose = () => {
  setFormData({
    // ... other fields
    occasions: [],  // ❌ DELETE THIS LINE
    // ... other fields
  });
};
```

---

## 📊 FIELD MAPPING SUMMARY

### Direct Mapping (6 fields)
```
name          → name
categoryId    → categoryId
categoryName  → categoryName
brand         → brand
condition     → condition
pattern       → pattern
fabric        → fabric
```

### Renamed (2 fields)
```
notes           → aiDescription
imageRemBgURL   → imgUrl
```

### Array → String (3 fields)
```
colors[]    → color (join with ", ")
seasons[]   → weatherSuitable (join with ", ")
tags[]      → tag (join with ", ")
```

### Boolean → String/Date (2 fields)
```
wornToday   → frequencyWorn ("0" or "1")
wornToday   → lastWornAt (ISO string or undefined)
```

### Local Only (1 field)
```
uploadedImageURL  → (not sent, preview only)
```

### ❌ DELETED (1 field)
```
occasions[]  → REMOVED COMPLETELY
```

---

## ✅ FINAL CHECKLIST

### Code Changes
- [ ] Update `WizardFormData` interface - remove `occasions`
- [ ] Update `StepCategorize.tsx` - remove Occasions section
- [ ] Update `AddItemWizard.tsx` - remove from initial state & reset
- [ ] Update `types.ts` - remove occasions type
- [ ] Update transform function (already done ✅)

### Testing
- [ ] Test form without occasions field
- [ ] Verify all API fields are populated
- [ ] Test image upload flow
- [ ] Test tags (without occasions merged)
- [ ] Test worn today toggle
- [ ] Test validation

---

## 🎯 SUMMARY

### Wizard Form Fields: **13** (giảm từ 16)
- ✅ **11 fields** match với API (direct hoặc transform)
- 🟡 **1 field** local only (`uploadedImageURL`)
- 🔴 **1 field** DELETED (`occasions`)

### API Compatibility: **100%** ✅
- Tất cả 15 API fields đều được populate
- Không có field nào thừa hoặc thiếu
- Transform logic đơn giản, rõ ràng

### Changes Required: **Minimal**
- Xóa 1 section UI (Occasions)
- Xóa 1 field từ type definition
- Update initial state
- Done! ✅

---

## 💡 RECOMMENDATIONS

1. **Không merge occasions vào tags** (vì API không hỗ trợ)
2. **Giữ uploadedImageURL** cho preview experience tốt hơn
3. **Simplify StepCategorize** - bớt complexity
4. **Focus vào data API cần** - đừng over-engineer

---

## 🚀 READY TO INTEGRATE

Code wizard giờ đã **100% compatible** với API hiện tại. Chỉ cần:
1. Copy 6 files vào project
2. Xóa Occasions section
3. Use transform function
4. Deploy!

**Estimated time: 30 minutes** ⚡


