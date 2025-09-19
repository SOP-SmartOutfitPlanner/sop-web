/**
 * Compress and resize image before converting to base64
 */
export const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert File to Base64 string (legacy - use compressImage instead)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
  });
};

/**
 * Create a demo base64 image (colored rectangle with text)
 */
export const createDemoBase64Image = (
  color: string, 
  text: string, 
  width: number = 400, 
  height: number = 400
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toDataURL('image/png');
};

/**
 * Generate demo wardrobe items with base64 images
 */
export const generateDemoItems = () => {
  const demoItems = [
    {
      name: "Classic White T-Shirt",
      type: "top" as const,
      brand: "Uniqlo",
      colors: ["White"],
      seasons: ["spring", "summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#f8f9fa"
    },
    {
      name: "Dark Blue Jeans",
      type: "bottom" as const,
      brand: "Levi's",
      colors: ["Blue"],
      seasons: ["fall", "winter", "spring"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#1e3a8a"
    },
    {
      name: "Black Formal Shoes",
      type: "shoes" as const,
      brand: "Cole Haan",
      colors: ["Black"],
      seasons: ["fall", "winter", "spring", "summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["formal"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#1f2937"
    },
    {
      name: "Navy Blazer",
      type: "outer" as const,
      brand: "Hugo Boss",
      colors: ["Navy"],
      seasons: ["fall", "winter", "spring"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["formal"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#1e40af"
    },
    {
      name: "Brown Leather Belt",
      type: "accessory" as const,
      brand: "Coach",
      colors: ["Brown"],
      seasons: ["fall", "winter", "spring", "summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual", "formal"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#92400e"
    },
    {
      name: "Red Summer Dress",
      type: "top" as const,
      brand: "Zara",
      colors: ["Red"],
      seasons: ["summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#dc2626"
    },
    {
      name: "White Sneakers",
      type: "shoes" as const,
      brand: "Nike",
      colors: ["White"],
      seasons: ["spring", "summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual", "sport"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#f3f4f6"
    },
    {
      name: "Grey Hoodie",
      type: "top" as const,
      brand: "Adidas",
      colors: ["Grey"],
      seasons: ["fall", "winter"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual", "sport"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#6b7280"
    },
    {
      name: "Black Leggings",
      type: "bottom" as const,
      brand: "Lululemon",
      colors: ["Black"],
      seasons: ["fall", "winter", "spring", "summer"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["sport", "casual"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#111827"
    },
    {
      name: "Pink Scarf",
      type: "accessory" as const,
      brand: "H&M",
      colors: ["Pink"],
      seasons: ["fall", "winter"] as ("spring" | "summer" | "fall" | "winter")[],
      occasions: ["casual"] as ("casual" | "formal" | "sport" | "travel")[],
      backgroundColor: "#ec4899"
    }
  ];

  return demoItems.map(item => ({
    ...item,
    imageUrl: createDemoBase64Image(item.backgroundColor, item.name),
    status: "active" as const
  }));
};
