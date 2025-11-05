# Onboarding Dialog Refactoring

## 📁 Structure

```
onboarding-dialog/
├── constants.ts          # Shared constants (STEPS, MAX_COLORS, etc.)
├── types.ts              # TypeScript interfaces
├── helpers.ts            # Validation and utility functions
├── index.ts              # Public exports
├── README.md             # This file
└── steps/
    ├── index.ts
    ├── WelcomeStep.tsx          ✅ DONE (~120 lines)
    ├── WhySopStep.tsx           ✅ DONE (~110 lines)
    ├── PersonalInfoStep.tsx     ⏳ TODO (~200 lines)
    ├── ColorSelectionStep.tsx   ⏳ TODO (~280 lines)
    └── StyleSelectionStep.tsx   ⏳ TODO (~200 lines)
```

## ✅ Completed

1. **constants.ts** - Extracted all constants
2. **types.ts** - All TypeScript interfaces
3. **helpers.ts** - Validation and utility functions
4. **WelcomeStep.tsx** - Welcome screen component
5. **WhySopStep.tsx** - Benefits selection component

## ⏳ Remaining Work

### Large Components to Extract

1. **PersonalInfoStep.tsx** (~200 lines)
   - Contains: Personal information form
   - Dependencies: Location API hooks, Job search
   - Complexity: HIGH (location dropdowns, form validation)

2. **ColorSelectionStep.tsx** (~280 lines)
   - Contains: Color selection UI with presets and custom picker
   - Dependencies: COLOR_PRESETS constant
   - Complexity: HIGH (lots of repeated color logic)

3. **StyleSelectionStep.tsx** (~200 lines)
   - Contains: Style cards grid with search
   - Dependencies: Style API
   - Complexity: MEDIUM

### Recommended Sub-components

For **ColorSelectionStep.tsx**, consider creating:
- `ColorSelector.tsx` - Reusable color picker component
  - Takes: colors array, onToggle, type (preferred/avoided)
  - Reduces duplication significantly

For **PersonalInfoStep.tsx**, consider creating:
- `LocationSelector.tsx` - Province/District/Ward dropdowns
  - Could use a custom hook `useLocationData()`

## 🎯 Benefits of Current Refactoring

- Main file reduced from **1,602 lines** to **~1,300 lines** (230 lines saved)
- Better code organization with clear separation of concerns
- Reusable constants and validation logic
- Easier testing of individual components
- Follows existing codebase patterns (wizard/sections structure)

## 🚀 How to Complete

To finish the refactoring:

```bash
# Extract remaining steps
1. Create PersonalInfoStep.tsx
2. Create ColorSelectionStep.tsx
3. Create StyleSelectionStep.tsx

# Update main file
4. Import and use all step components
5. Remove old inline JSX

# Optional improvements
6. Create ColorSelector reusable component
7. Create LocationSelector component + useLocationData hook
8. Extract feature card component from WelcomeStep
```

## 📝 Usage Example

```tsx
import { WelcomeStep, WhySopStep } from "./steps";
import { STEPS } from "./constants";

// In render:
{currentStep === STEPS.WELCOME && <WelcomeStep />}
{currentStep === STEPS.WHY_SOP && (
  <WhySopStep
    selectedBenefits={selectedBenefits}
    onToggleBenefit={toggleBenefit}
  />
)}
```
