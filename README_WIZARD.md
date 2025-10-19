# 🧙‍♂️ Wizard Form - Quick Start Guide

## 🎯 What We Built

A **3-step wizard form** to add items to wardrobe with **AI analysis**.

---

## 📁 File Structure

```
src/components/wardrobe/wizard/
├── AddItemWizard.tsx       # Main wizard component
├── StepPhotoAI.tsx         # Step 1: Upload & AI
├── StepBasics.tsx          # Step 2: Name, category
├── StepCategorize.tsx      # Step 3: Colors, tags
├── WizardFooter.tsx        # Navigation footer
├── types.ts                # TypeScript types
├── constants.ts            # Constants (colors, categories, etc.)
└── index.ts                # Exports

src/lib/utils/
├── wizard-transform.ts     # Transform wizard → API
└── ai-suggestions-parser.ts # Parse AI response
```

---

## 🚀 How to Use

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Navigate to Wardrobe
```
http://localhost:3000/wardrobe
```

### 3. Click "Add Item" Button

### 4. Follow 3 Steps

**Step 1: Upload Photo & AI Analysis**
- Upload image (drag/drop or click)
- Click "Analyze with AI"
- Review AI suggestions
- Apply all or individual suggestions

**Step 2: Basic Info**
- Enter name (or use AI suggestion)
- Select category
- Choose brand
- Add notes/description

**Step 3: Categorize Details**
- Select colors (max 3)
- Choose seasons
- Pick pattern & fabric
- Set condition
- Add tags
- Toggle "worn today"

### 5. Submit!

Item will be created and appear in your wardrobe.

---

## ✨ Features

### ✅ What's Working
- 3-step wizard flow
- Progress indicator
- AI image analysis (real API)
- Vietnamese language support
- Drag & drop upload
- Paste from clipboard
- Color picker (visual)
- Season selection (with emoji)
- Tag suggestions
- Form validation
- Keyboard shortcuts (Esc, Ctrl+Enter)
- Confirm before close
- Loading states
- Error handling
- Toast notifications

### ❌ What's Removed
- `occasions` field (not in API)

---

## 🔧 Configuration

### Categories (in `constants.ts`)
```typescript
export const CATEGORY_OPTIONS = [
  { id: 1, name: 'Top', group: 'Top' },
  { id: 2, name: 'Bottom', group: 'Bottom' },
  { id: 3, name: 'Shoes', group: 'Shoes' },
  { id: 4, name: 'Outerwear', group: 'Outerwear' },
  { id: 5, name: 'Accessory', group: 'Accessory' },
  { id: 6, name: 'Dress', group: 'Dress' },
  { id: 7, name: 'Underwear', group: 'Underwear' },
];
```

### Colors (in `constants.ts`)
```typescript
export const DEFAULT_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  // ... 12 colors total
];
```

### Seasons
```typescript
export const SEASONS = [
  { name: 'Spring', emoji: '🌱' },
  { name: 'Summer', emoji: '☀️' },
  { name: 'Fall', emoji: '🍂' },
  { name: 'Winter', emoji: '❄️' },
  { name: 'All-year', emoji: '🌎' },
];
```

---

## 🤖 AI Integration

### API Endpoint
```
POST /api/v1/items/summary
Content-Type: multipart/form-data
```

### Request
```typescript
FormData {
  file: File // Image file
}
```

### Response (Vietnamese)
```json
{
  "statusCode": 200,
  "message": "Get summary image successfully",
  "data": {
    "color": "Đen",
    "aiDescription": "Chiếc áo thun...",
    "weatherSuitable": "Mùa hè, Thời tiết mát mẻ",
    "condition": "Mới",
    "pattern": "Logo, Chuyển màu",
    "fabric": "Cotton",
    "imageRemBgURL": "https://..."
  }
}
```

### Auto-parsed to English
```typescript
// Vietnamese → English mapping
"Mùa hè" → "Summer"
"Thời tiết mát mẻ" → "Fall"
"Đen" → { name: "Đen", hex: "#000000" }
```

---

## 📊 Data Transform

### Wizard Form → API

```typescript
// Wizard (arrays)
colors: [{ name: "White", hex: "#FFF" }]
seasons: ["Summer", "Spring"]
tags: ["basic", "casual"]

// ↓ Transformed to ↓

// API (strings)
color: "White"
weatherSuitable: "Summer, Spring"
tag: "basic, casual"
```

### Full Example

**Input:**
```typescript
{
  name: "White T-Shirt",
  colors: [{ name: "White", hex: "#FFF" }],
  seasons: ["Summer"],
  tags: ["basic"],
  wornToday: true
}
```

**Output (sent to API):**
```json
{
  "userId": 123,
  "name": "White T-Shirt",
  "color": "White",
  "weatherSuitable": "Summer",
  "tag": "basic",
  "frequencyWorn": "1",
  "lastWornAt": "2025-10-15T..."
}
```

---

## 🐛 Troubleshooting

### AI Analysis Not Working?

**Check:**
1. Network tab for `/items/summary` request
2. File is being sent correctly
3. API endpoint is correct
4. CORS settings

**Debug:**
```javascript
// In StepPhotoAI.tsx, line ~78
console.log('Uploading file:', file);
console.log('AI Response:', response);
```

### Submit Fails?

**Check:**
1. All required fields filled
2. Category selected
3. API endpoint `/items`

**Debug:**
```javascript
// In AddItemWizard.tsx, line ~158
console.log('Payload:', payload);
```

### Validation Errors?

**Check:**
1. Name OR photo required
2. Category required

**Debug:**
```javascript
// In wizard-transform.ts
console.log('Validation errors:', errors);
```

---

## 🎨 Customization

### Change Colors Palette
Edit `src/components/wardrobe/wizard/constants.ts`:
```typescript
export const DEFAULT_COLORS: ColorOption[] = [
  { name: 'Your Color', hex: '#HEX' },
  // Add more...
];
```

### Add More Categories
Edit `src/components/wardrobe/wizard/constants.ts`:
```typescript
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 8, name: 'New Category', group: 'New Category' },
];
```

### Change Brands
Edit `src/components/wardrobe/wizard/constants.ts`:
```typescript
export const BRAND_OPTIONS = [
  'Your Brand',
  // Add more...
];
```

---

## 📚 API Reference

### `transformWizardDataToAPI()`
```typescript
transformWizardDataToAPI(
  formData: WizardFormData,
  userId: number
): CreateWardrobeItemRequest
```

Transforms wizard form data to API format.

### `parseAIResponseToFormData()`
```typescript
parseAIResponseToFormData(
  aiResponse: ImageSummaryResponse['data']
): Partial<WizardFormData>
```

Parses AI response (Vietnamese) to wizard form updates.

### `validateWizardFormData()`
```typescript
validateWizardFormData(
  formData: WizardFormData
): string[]
```

Validates form data. Returns array of error messages.

---

## ✅ Testing Checklist

- [ ] Upload image via button
- [ ] Drag & drop image
- [ ] AI analysis works
- [ ] Apply suggestions works
- [ ] Navigate between steps
- [ ] Back button works
- [ ] Validation shows errors
- [ ] Submit creates item
- [ ] Item appears in wardrobe
- [ ] Close confirmation works
- [ ] Keyboard shortcuts work

---

## 🎉 Done!

Wizard form is ready. Just test it in browser!

```bash
npm run dev
# Go to http://localhost:3000/wardrobe
# Click "Add Item"
# Enjoy! ✨
```

---

**Questions?** Check `WIZARD_SETUP_COMPLETE.md` for detailed documentation.


