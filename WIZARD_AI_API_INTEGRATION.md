# Wizard Form + AI API Integration

## 🤖 API AI ANALYSIS

### Endpoint
```bash
POST /api/v1/items/summary
Content-Type: multipart/form-data
```

### Request
```typescript
FormData {
  file: File  // Image file (jpeg, png...)
}
```

### Response Structure
```typescript
{
  "statusCode": 200,
  "message": "Get summary image successfully",
  "data": {
    "color": string,              // "Đen", "Trắng", "Xanh navy"...
    "aiDescription": string,      // Mô tả chi tiết bằng tiếng Việt
    "weatherSuitable": string,    // "Mùa hè, Thời tiết mát mẻ"
    "condition": string,          // "Mới", "Như mới", "Tốt"...
    "pattern": string,            // "Logo, Chuyển màu", "Solid"...
    "fabric": string,             // "Cotton", "Polyester"...
    "imageRemBgURL": string       // URL ảnh đã remove background
  }
}
```

### Example Response
```json
{
  "statusCode": 200,
  "message": "Get summary image successfully",
  "data": {
    "color": "Đen",
    "aiDescription": "Chiếc áo thun ngắn tay màu đen này có chữ \"TEELAB\" ở ngực và họa tiết chuyển màu trắng xám ở phía dưới. Đây là một món đồ cơ bản, dễ phối hợp cho phong cách thường ngày.",
    "weatherSuitable": "Mùa hè, Thời tiết mát mẻ",
    "condition": "Mới",
    "pattern": "Logo, Chuyển màu",
    "fabric": "Cotton",
    "imageRemBgURL": "https://storage.wizlab.io.vn/sop/8555954f-bd4b-4842-b3dc-a8eba1b20345.jpg"
  }
}
```

---

## 🔄 MAPPING: API Response → Wizard Form

### AI Response Type (Already in project)
```typescript
// src/lib/api/wardrobe-api.ts
export interface ImageSummaryResponse {
  statusCode: number;
  message: string;
  data: {
    color: string;              // ✅ Already matches
    aiDescription: string;      // ✅ Already matches
    weatherSuitable: string;    // ✅ Already matches
    condition: string;          // ✅ Already matches
    pattern: string;            // ✅ Already matches
    fabric: string;             // ✅ Already matches
    imageRemBgURL: string;      // ✅ Already matches
  };
}
```

### Wizard AI Suggestions Type (Need Update)

**Current (from Lovable):**
```typescript
interface AISuggestions {
  name: string;
  type: { id: number; name: string; confidence: number };
  colors: { name: string; hex: string; confidence: number }[];
  brand: { value: string; confidence: number };
  weather: string[];
  fabric: string;
  pattern: string;
  condition: string;
  imageRemBgURL: string;
}
```

**Updated (Match API):**
```typescript
interface AISuggestions {
  color: string;              // "Đen" (from API)
  aiDescription: string;      // AI description
  weatherSuitable: string;    // "Mùa hè, Thời tiết mát mẻ"
  condition: string;          // "Mới"
  pattern: string;            // "Logo, Chuyển màu"
  fabric: string;             // "Cotton"
  imageRemBgURL: string;      // URL ảnh đã remove bg
  
  // Derived fields (parse từ API response)
  colors?: string[];          // Parse từ color: "Đen" → ["Đen"]
  seasons?: string[];         // Parse từ weatherSuitable
}
```

---

## 🔧 INTEGRATION CODE

### 1. Update AI Analysis Function

```typescript
// src/components/wardrobe/wizard/StepPhotoAI.tsx

const handleAIAnalyze = async () => {
  if (!formData.uploadedImageURL) return;

  setIsAnalyzing(true);
  
  try {
    // Convert base64 to file
    const file = await base64ToFile(formData.uploadedImageURL, 'item.jpg');
    
    // Call real API
    const response = await wardrobeAPI.getImageSummary(file);
    
    // Transform API response to wizard format
    const aiSuggestions: AISuggestions = {
      color: response.data.color,
      aiDescription: response.data.aiDescription,
      weatherSuitable: response.data.weatherSuitable,
      condition: response.data.condition,
      pattern: response.data.pattern,
      fabric: response.data.fabric,
      imageRemBgURL: response.data.imageRemBgURL,
      
      // Parse colors
      colors: parseColors(response.data.color),
      
      // Parse seasons
      seasons: parseSeasons(response.data.weatherSuitable),
    };

    setAiSuggestions(aiSuggestions);
    toast.success('Phân tích thành công!');
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    toast.error('Không thể phân tích ảnh. Vui lòng thử lại.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

### 2. Helper Functions

```typescript
// Parse color string to array
function parseColors(colorString: string): string[] {
  // "Đen" → ["Đen"]
  // "Đen, Trắng" → ["Đen", "Trắng"]
  return colorString.split(',').map(c => c.trim());
}

// Parse weather string to seasons array
function parseSeasons(weatherString: string): string[] {
  // "Mùa hè, Thời tiết mát mẻ" → ["Summer", "Fall"]
  const seasonMap: Record<string, string> = {
    'mùa hè': 'Summer',
    'mùa xuân': 'Spring',
    'mùa thu': 'Fall',
    'mùa đông': 'Winter',
    'thời tiết mát mẻ': 'Fall',
    'thời tiết nóng': 'Summer',
  };
  
  const parts = weatherString.toLowerCase().split(',').map(s => s.trim());
  return parts
    .map(part => seasonMap[part])
    .filter(Boolean);
}

// Convert base64 to File object
async function base64ToFile(base64: string, filename: string): Promise<File> {
  const response = await fetch(base64);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

// Get default color hex from Vietnamese name
function getColorHex(vietnameseName: string): string {
  const colorMap: Record<string, string> = {
    'đen': '#000000',
    'trắng': '#FFFFFF',
    'xanh navy': '#1F345A',
    'xanh dương': '#0066CC',
    'đỏ': '#DC143C',
    'vàng': '#FFD700',
    'be': '#E6D8B6',
    'nâu': '#8B4513',
    'xám': '#808080',
    'hồng': '#FFB6C1',
  };
  
  return colorMap[vietnameseName.toLowerCase()] || '#808080';
}
```

---

### 3. Apply AI Suggestions to Form

```typescript
// Auto-fill form with AI data
const applyAllSuggestions = () => {
  if (!aiSuggestions) return;

  // Parse colors from AI response
  const colorObjects = (aiSuggestions.colors || [aiSuggestions.color])
    .map(colorName => ({
      name: colorName,
      hex: getColorHex(colorName),
    }));

  updateFormData({
    // Use AI description as notes
    notes: aiSuggestions.aiDescription,
    
    // Colors
    colors: colorObjects,
    
    // Seasons
    seasons: aiSuggestions.seasons || [],
    
    // Details
    pattern: aiSuggestions.pattern,
    fabric: aiSuggestions.fabric,
    condition: aiSuggestions.condition,
    
    // Image with background removed
    imageRemBgURL: aiSuggestions.imageRemBgURL,
  });

  toast.success('Đã áp dụng tất cả gợi ý!');
};
```

---

### 4. Update StepPhotoAI UI

```typescript
// Show AI suggestions in Vietnamese
{aiSuggestions && (
  <Card className="p-4 border-emerald-200 bg-emerald-50/50">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        Kết quả phân tích AI
      </h4>
      <Button size="sm" variant="outline" onClick={applyAllSuggestions}>
        Áp dụng tất cả
      </Button>
    </div>

    <div className="space-y-2 text-sm">
      {/* Color */}
      <div className="flex items-center justify-between p-2 rounded bg-background border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-20">Màu sắc:</span>
          <span>{aiSuggestions.color}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => applyColor()}>
          <Check className="w-3 h-3" />
        </Button>
      </div>

      {/* Weather */}
      <div className="flex items-center justify-between p-2 rounded bg-background border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-20">Thời tiết:</span>
          <span>{aiSuggestions.weatherSuitable}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => applySeasons()}>
          <Check className="w-3 h-3" />
        </Button>
      </div>

      {/* Fabric */}
      <div className="flex items-center justify-between p-2 rounded bg-background border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-20">Chất liệu:</span>
          <span>{aiSuggestions.fabric}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => updateFormData({ fabric: aiSuggestions.fabric })}>
          <Check className="w-3 h-3" />
        </Button>
      </div>

      {/* Pattern */}
      <div className="flex items-center justify-between p-2 rounded bg-background border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-20">Họa tiết:</span>
          <span>{aiSuggestions.pattern}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => updateFormData({ pattern: aiSuggestions.pattern })}>
          <Check className="w-3 h-3" />
        </Button>
      </div>

      {/* Condition */}
      <div className="flex items-center justify-between p-2 rounded bg-background border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-20">Tình trạng:</span>
          <span>{aiSuggestions.condition}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => updateFormData({ condition: aiSuggestions.condition })}>
          <Check className="w-3 h-3" />
        </Button>
      </div>

      {/* Description */}
      <div className="p-2 rounded bg-background border">
        <span className="text-xs font-medium text-muted-foreground block mb-1">Mô tả:</span>
        <p className="text-sm">{aiSuggestions.aiDescription}</p>
        <Button 
          size="sm" 
          variant="ghost" 
          className="mt-2"
          onClick={() => updateFormData({ notes: aiSuggestions.aiDescription })}
        >
          <Check className="w-3 h-3 mr-1" />
          Sử dụng mô tả này
        </Button>
      </div>
    </div>

    <p className="text-xs text-muted-foreground mt-3">
      💡 Bạn có thể chỉnh sửa các thông tin này ở bước tiếp theo.
    </p>
  </Card>
)}
```

---

## 📝 CHANGES SUMMARY

### Files to Update

1. **`StepPhotoAI.tsx`**
   - ✅ Update `AISuggestions` type
   - ✅ Update `handleAIAnalyze()` to call real API
   - ✅ Add helper functions (parseColors, parseSeasons, base64ToFile)
   - ✅ Update UI to show Vietnamese text
   - ✅ Update `applyAllSuggestions()` logic

2. **`types.ts`**
   - ✅ Update `AISuggestions` interface to match API

3. **Helper utilities**
   - ✅ Add season mapping (Vietnamese → English)
   - ✅ Add color name → hex mapping

---

## 🌍 VIETNAMESE → ENGLISH MAPPING

### Seasons
```typescript
const SEASON_MAP: Record<string, string> = {
  'mùa hè': 'Summer',
  'mùa xuân': 'Spring',
  'mùa thu': 'Fall',
  'mùa đông': 'Winter',
  'thời tiết mát mẻ': 'Fall',
  'thời tiết nóng': 'Summer',
  'thời tiết ấm': 'Spring',
  'thời tiết lạnh': 'Winter',
};
```

### Colors
```typescript
const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  'đen': { name: 'Đen', hex: '#000000' },
  'trắng': { name: 'Trắng', hex: '#FFFFFF' },
  'xanh navy': { name: 'Navy', hex: '#1F345A' },
  'be': { name: 'Beige', hex: '#E6D8B6' },
  'nâu': { name: 'Nâu', hex: '#8B4513' },
  'xám': { name: 'Xám', hex: '#808080' },
  // ... add more
};
```

---

## ✅ API INTEGRATION CHECKLIST

- [ ] Update `AISuggestions` type to match API response
- [ ] Implement `handleAIAnalyze()` with real API call
- [ ] Add `base64ToFile()` helper
- [ ] Add `parseColors()` helper
- [ ] Add `parseSeasons()` helper with Vietnamese mapping
- [ ] Add `getColorHex()` helper
- [ ] Update UI labels to Vietnamese
- [ ] Update `applyAllSuggestions()` logic
- [ ] Test with real image upload
- [ ] Handle API errors gracefully

---

## 🎯 RESULT

✅ Wizard form sẽ:
1. Upload ảnh → Call `/items/summary` API
2. Nhận response tiếng Việt
3. Parse và convert data
4. Auto-fill form với AI suggestions
5. User có thể chỉnh sửa trước khi submit

**100% integrated với API thực tế!** 🚀


