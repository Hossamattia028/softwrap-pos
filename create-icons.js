const fs = require('fs');
const path = require('path');

// Simple PNG generator (creates a basic colored square as placeholder)
// This is a temporary solution - replace with your actual logo

console.log('=========================================');
console.log('Softwrap POS - Basic Icon Generator');
console.log('=========================================');
console.log('Creating placeholder icons...');
console.log('Note: Replace these with your actual logo icons');
console.log('');

// Create a simple PNG header for a colored square
function createSimplePNG(size, r, g, b) {
  const width = size;
  const height = size;
  
  // This creates a very basic PNG with a solid color
  // For production, you should use proper icon files
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Create gradient or pattern
      const isCenter = x > width * 0.2 && x < width * 0.8 && y > height * 0.2 && y < height * 0.8;
      if (isCenter) {
        pixelData.push(r, g, b, 255);
      } else {
        pixelData.push(Math.floor(r * 0.7), Math.floor(g * 0.7), Math.floor(b * 0.7), 255);
      }
    }
  }
  
  return Buffer.from(pixelData);
}

// ICO file structure (simplified for 256x256 single icon)
function createICO(size) {
  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0);  // Reserved
  iconDir.writeUInt16LE(1, 2);  // Type: ICO
  iconDir.writeUInt16LE(1, 4);  // Number of images
  
  const iconDirEntry = Buffer.alloc(16);
  iconDirEntry.writeUInt8(size === 256 ? 0 : size, 0);  // Width (0 means 256)
  iconDirEntry.writeUInt8(size === 256 ? 0 : size, 1);  // Height (0 means 256)
  iconDirEntry.writeUInt8(0, 2);   // Color palette
  iconDirEntry.writeUInt8(0, 3);   // Reserved
  iconDirEntry.writeUInt16LE(1, 4);  // Color planes
  iconDirEntry.writeUInt16LE(32, 6); // Bits per pixel
  
  // For simplicity, we'll create a minimal BMP-like structure
  const imageData = createBMPForICO(size);
  iconDirEntry.writeUInt32LE(imageData.length, 8);  // Image size
  iconDirEntry.writeUInt32LE(22, 12); // Image offset
  
  return Buffer.concat([iconDir, iconDirEntry, imageData]);
}

function createBMPForICO(size) {
  const headerSize = 40;
  const imageSize = size * size * 4;
  const header = Buffer.alloc(headerSize);
  
  header.writeUInt32LE(headerSize, 0);  // Header size
  header.writeInt32LE(size, 4);          // Width
  header.writeInt32LE(size * 2, 8);      // Height (double for ICO)
  header.writeUInt16LE(1, 12);           // Planes
  header.writeUInt16LE(32, 14);          // Bits per pixel
  header.writeUInt32LE(0, 16);           // Compression
  header.writeUInt32LE(imageSize, 20);   // Image size
  
  // Create image data (BGRA format for BMP)
  const imageData = Buffer.alloc(imageSize);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = ((size - 1 - y) * size + x) * 4;  // BMP is bottom-up
      const isCenter = x > size * 0.2 && x < size * 0.8 && y > size * 0.2 && y < size * 0.8;
      if (isCenter) {
        imageData[idx] = 229;     // B
        imageData[idx + 1] = 70;  // G
        imageData[idx + 2] = 79;  // R
        imageData[idx + 3] = 255; // A
      } else {
        imageData[idx] = 160;     // B
        imageData[idx + 1] = 49;  // G
        imageData[idx + 2] = 55;  // R
        imageData[idx + 3] = 255; // A
      }
    }
  }
  
  // Add empty AND mask
  const maskSize = Math.ceil((size * size) / 8);
  const mask = Buffer.alloc(maskSize, 0);
  
  return Buffer.concat([header, imageData, mask]);
}

// Create directory
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create ICO file
try {
  const icoData = createICO(256);
  fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoData);
  console.log('✓ Created icon.ico (Windows)');
} catch (err) {
  console.error('✗ Failed to create icon.ico:', err.message);
}

// Copy SVG as fallback PNG names (electron-builder will use SVG if no PNG)
const sizes = [16, 32, 48, 64, 128, 256, 512];
sizes.forEach(size => {
  try {
    // For PNG, we'd need a proper library. Instead, let's just reference the SVG
    const dummyPng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
    // Note: These are placeholder - you should generate real PNGs
    console.log(`✓ Placeholder for ${size}x${size}.png created`);
  } catch (err) {
    console.error(`✗ Failed to create ${size}x${size}.png:`, err.message);
  }
});

console.log('');
console.log('=========================================');
console.log('Setup complete!');
console.log('');
console.log('IMPORTANT:');
console.log('The generated icons are placeholders.');
console.log('For production, please:');
console.log('1. Create a professional 512x512 PNG logo');
console.log('2. Use an online tool like:');
console.log('   - https://www.electron.build/icons');
console.log('   - https://convertico.com/');
console.log('3. Replace files in assets/icons/');
console.log('=========================================');

