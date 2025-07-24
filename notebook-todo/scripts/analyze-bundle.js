#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeBundle() {
  const distPath = path.join(__dirname, '../dist/assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build not found. Run "npm run build" first.');
    return;
  }

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));

  console.log('📊 Bundle Analysis Report\n');
  console.log('='.repeat(50));

  let totalSize = 0;
  let totalGzipEstimate = 0;

  console.log('\n📦 JavaScript Bundles:');
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const gzipEstimate = (stats.size * 0.3 / 1024).toFixed(2); // Rough gzip estimate
    
    totalSize += stats.size;
    totalGzipEstimate += stats.size * 0.3;
    
    console.log(`  ${file}: ${sizeKB} KB (${gzipEstimate} KB gzipped)`);
  });

  console.log('\n🎨 CSS Files:');
  cssFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const gzipEstimate = (stats.size * 0.4 / 1024).toFixed(2); // CSS compresses better
    
    totalSize += stats.size;
    totalGzipEstimate += stats.size * 0.4;
    
    console.log(`  ${file}: ${sizeKB} KB (${gzipEstimate} KB gzipped)`);
  });

  console.log('\n📈 Summary:');
  console.log(`  Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`  Estimated Gzipped: ${(totalGzipEstimate / 1024).toFixed(2)} KB`);
  console.log(`  Number of Chunks: ${jsFiles.length}`);

  // Performance recommendations
  console.log('\n💡 Performance Insights:');
  
  const largeChunks = jsFiles.filter(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    return stats.size > 300 * 1024; // > 300KB
  });

  if (largeChunks.length > 0) {
    console.log(`  ⚠️  Large chunks detected: ${largeChunks.join(', ')}`);
    console.log('     Consider further code splitting for these files.');
  } else {
    console.log('  ✅ All chunks are under 300KB - good job!');
  }

  if (totalGzipEstimate / 1024 < 200) {
    console.log('  ✅ Total gzipped size is under 200KB - excellent!');
  } else if (totalGzipEstimate / 1024 < 500) {
    console.log('  👍 Total gzipped size is reasonable.');
  } else {
    console.log('  ⚠️  Total gzipped size is quite large. Consider optimizations.');
  }

  console.log('\n='.repeat(50));
}

analyzeBundle();