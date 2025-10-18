# SOP Admin Portal - Library Installation Script (PowerShell)

Write-Host "🚀 Installing Admin Portal Libraries..." -ForegroundColor Cyan
Write-Host ""

# Priority 1: Data Visualization
Write-Host "📊 Installing Recharts..." -ForegroundColor Yellow
npm install recharts

# Priority 2: Advanced Tables
Write-Host "📋 Installing TanStack Table..." -ForegroundColor Yellow
npm install @tanstack/react-table

# Priority 3: Date Handling
Write-Host "📅 Installing date-fns..." -ForegroundColor Yellow
npm install date-fns

# Priority 4: File Upload
Write-Host "📤 Installing react-dropzone..." -ForegroundColor Yellow
npm install react-dropzone

# Priority 5: Export Functionality
Write-Host "📊 Installing XLSX..." -ForegroundColor Yellow
npm install xlsx

# Bonus: Command Palette
Write-Host "⌨️  Installing cmdk..." -ForegroundColor Yellow
npm install cmdk

# Bonus: Animations
Write-Host "🎭 Installing framer-motion..." -ForegroundColor Yellow
npm install framer-motion

Write-Host ""
Write-Host "✅ All admin libraries installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check ADMIN_LIBRARIES.md for usage examples"
Write-Host "2. Import components in your admin pages"
Write-Host "3. Customize as needed"

