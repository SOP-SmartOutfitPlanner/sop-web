#!/bin/bash

# SOP Admin Portal - Library Installation Script

echo "🚀 Installing Admin Portal Libraries..."
echo ""

# Priority 1: Data Visualization
echo "📊 Installing Recharts..."
npm install recharts

# Priority 2: Advanced Tables
echo "📋 Installing TanStack Table..."
npm install @tanstack/react-table

# Priority 3: Date Handling
echo "📅 Installing date-fns..."
npm install date-fns

# Priority 4: File Upload
echo "📤 Installing react-dropzone..."
npm install react-dropzone

# Priority 5: Export Functionality
echo "📊 Installing XLSX..."
npm install xlsx

# Bonus: Command Palette
echo "⌨️  Installing cmdk..."
npm install cmdk

# Bonus: Animations
echo "🎭 Installing framer-motion..."
npm install framer-motion

echo ""
echo "✅ All admin libraries installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Check ADMIN_LIBRARIES.md for usage examples"
echo "2. Import components in your admin pages"
echo "3. Customize as needed"

