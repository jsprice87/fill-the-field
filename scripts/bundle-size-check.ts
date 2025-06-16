
import * as fs from 'fs';
import { execSync } from 'child_process';

interface BundleSizeResult {
  timestamp: string;
  phase: string;
  files: {
    name: string;
    size: number;
    gzipSize: number;
  }[];
  totalSize: number;
  totalGzipSize: number;
}

function getBundleSize(phase: string): BundleSizeResult {
  console.log(`Building for bundle size check (${phase})...`);
  
  try {
    // Build the project
    execSync('npm run build', { stdio: 'inherit' });
    
    // Get dist folder stats
    const distPath = './dist';
    const files: BundleSizeResult['files'] = [];
    let totalSize = 0;
    
    function scanDistFolder(dir: string) {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = `${dir}/${entry}`;
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDistFolder(fullPath);
        } else if (entry.endsWith('.js') || entry.endsWith('.css')) {
          const size = stat.size;
          
          // Approximate gzip size (typically ~30% of original for JS/CSS)
          const gzipSize = Math.round(size * 0.3);
          
          files.push({
            name: fullPath.replace('./dist/', ''),
            size,
            gzipSize
          });
          
          totalSize += size;
        }
      }
    }
    
    scanDistFolder(distPath);
    
    const result: BundleSizeResult = {
      timestamp: new Date().toISOString(),
      phase,
      files: files.sort((a, b) => b.size - a.size),
      totalSize,
      totalGzipSize: Math.round(totalSize * 0.3)
    };
    
    // Write result to file
    const fileName = `dist-size-${phase}.json`;
    fs.writeFileSync(fileName, JSON.stringify(result, null, 2));
    
    // Also create a human-readable summary
    const summary = generateSizeSummary(result);
    fs.writeFileSync(`dist-size-${phase}.txt`, summary);
    
    console.log(`Bundle size check complete for ${phase}`);
    console.log(`Total size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Estimated gzip: ${(result.totalGzipSize / 1024).toFixed(2)} KB`);
    
    return result;
    
  } catch (error) {
    console.error('Bundle size check failed:', error);
    throw error;
  }
}

function generateSizeSummary(result: BundleSizeResult): string {
  let summary = `Bundle Size Report - ${result.phase}\n`;
  summary += `Generated: ${result.timestamp}\n\n`;
  summary += `Total Size: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB\n`;
  summary += `Estimated Gzip: ${(result.totalGzipSize / 1024).toFixed(2)} KB\n\n`;
  summary += `Largest Files:\n`;
  
  result.files.slice(0, 10).forEach(file => {
    summary += `  ${file.name}: ${(file.size / 1024).toFixed(1)} KB (${(file.gzipSize / 1024).toFixed(1)} KB gzip)\n`;
  });
  
  return summary;
}

function compareBundleSizes(baselineFile: string, currentFile: string): void {
  if (!fs.existsSync(baselineFile)) {
    console.log('No baseline file found - this will become the baseline');
    return;
  }
  
  const baseline: BundleSizeResult = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
  const current: BundleSizeResult = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
  
  const sizeDiff = current.totalSize - baseline.totalSize;
  const gzipDiff = current.totalGzipSize - baseline.totalGzipSize;
  
  console.log('\n📊 Bundle Size Comparison:');
  console.log(`Baseline (${baseline.phase}): ${(baseline.totalGzipSize / 1024).toFixed(2)} KB gzip`);
  console.log(`Current (${current.phase}): ${(current.totalGzipSize / 1024).toFixed(2)} KB gzip`);
  console.log(`Difference: ${gzipDiff > 0 ? '+' : ''}${(gzipDiff / 1024).toFixed(2)} KB gzip`);
  
  if (gzipDiff > 200 * 1024) { // 200 KB threshold
    console.error('⚠️  Bundle size increase exceeds 200 KB threshold!');
    process.exit(1);
  } else if (gzipDiff > 50 * 1024) {
    console.warn('⚠️  Bundle size increased by more than 50 KB');
  } else {
    console.log('✅ Bundle size increase within acceptable limits');
  }
}

// Run if called directly
if (require.main === module) {
  const phase = process.argv[2] || 'unknown';
  getBundleSize(phase);
}

export { getBundleSize, compareBundleSizes };
