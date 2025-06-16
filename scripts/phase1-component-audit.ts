
import * as fs from 'fs';
import * as path from 'path';

interface ComponentUsage {
  component: string;
  importPath: string;
  files: string[];
  usageCount: number;
  mantineTarget: string;
  complexity: 'DIRECT' | 'WRAP' | 'NEEDS-CONFIRMATION';
  notes?: string;
}

// Load the existing migration mapping from docs/mantine-migration.md
function loadMigrationMapping(): Record<string, { mantine: string; complexity: ComponentUsage['complexity']; notes?: string }> {
  const migrationPath = './docs/mantine-migration.md';
  
  if (!fs.existsSync(migrationPath)) {
    console.warn('mantine-migration.md not found, using fallback mapping');
    return getFallbackMapping();
  }

  const content = fs.readFileSync(migrationPath, 'utf8');
  const mapping: Record<string, { mantine: string; complexity: ComponentUsage['complexity']; notes?: string }> = {};

  // Parse the migration guide to extract mappings
  // This is a simplified parser - we'll enhance based on the actual file structure
  const lines = content.split('\n');
  let currentComponent = '';
  
  for (const line of lines) {
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      const match = line.match(/#{3,4}\s+(.+)/);
      if (match) {
        currentComponent = match[1].trim();
      }
    } else if (line.includes('→') && currentComponent) {
      const parts = line.split('→');
      if (parts.length === 2) {
        const component = parts[0].trim().replace(/\*\*/g, '');
        const mantineTarget = parts[1].trim();
        
        let complexity: ComponentUsage['complexity'] = 'DIRECT';
        if (mantineTarget.includes('WRAP') || mantineTarget.includes('custom')) {
          complexity = 'WRAP';
        }
        
        mapping[component] = {
          mantine: mantineTarget,
          complexity
        };
      }
    }
  }
  
  return Object.keys(mapping).length > 0 ? mapping : getFallbackMapping();
}

function getFallbackMapping(): Record<string, { mantine: string; complexity: ComponentUsage['complexity']; notes?: string }> {
  return {
    'Button': { mantine: '@mantine/core Button', complexity: 'DIRECT' },
    'Input': { mantine: '@mantine/core TextInput', complexity: 'DIRECT' },
    'Textarea': { mantine: '@mantine/core Textarea', complexity: 'DIRECT' },
    'Select': { mantine: '@mantine/core Select', complexity: 'WRAP', notes: 'Complex trigger/content pattern' },
    'Card': { mantine: '@mantine/core Card', complexity: 'DIRECT' },
    'Badge': { mantine: '@mantine/core Badge', complexity: 'DIRECT' },
    'Table': { mantine: '@mantine/core Table + ScrollArea', complexity: 'WRAP', notes: 'Sticky headers + scroll behavior' },
    'Dialog': { mantine: '@mantine/core Modal', complexity: 'WRAP', notes: 'Trigger/content pattern + focus management' },
    'DropdownMenu': { mantine: '@mantine/core Menu', complexity: 'WRAP', notes: 'Complex trigger/content pattern' },
    'Tooltip': { mantine: '@mantine/core Tooltip', complexity: 'DIRECT' },
    'Switch': { mantine: '@mantine/core Switch', complexity: 'DIRECT' },
    'Checkbox': { mantine: '@mantine/core Checkbox', complexity: 'DIRECT' },
    'Tabs': { mantine: '@mantine/core Tabs', complexity: 'DIRECT' },
    'Progress': { mantine: '@mantine/core Progress', complexity: 'DIRECT' },
    'Separator': { mantine: '@mantine/core Divider', complexity: 'DIRECT' },
    'Popover': { mantine: '@mantine/core Popover', complexity: 'WRAP' },
    'Sheet': { mantine: '@mantine/core Drawer', complexity: 'WRAP' },
    'ScrollArea': { mantine: '@mantine/core ScrollArea', complexity: 'DIRECT' },
    'Slider': { mantine: '@mantine/core Slider', complexity: 'DIRECT' },
    'Toggle': { mantine: '@mantine/core Switch (custom)', complexity: 'WRAP' },
    'RadioGroup': { mantine: '@mantine/core Radio.Group', complexity: 'DIRECT' },
    'HoverCard': { mantine: '@mantine/core HoverCard', complexity: 'DIRECT' },
    'Toast': { mantine: '@mantine/notifications', complexity: 'WRAP' },
    'Sonner': { mantine: '@mantine/notifications', complexity: 'WRAP' },
    'Skeleton': { mantine: '@mantine/core Skeleton', complexity: 'DIRECT' },
    'Pagination': { mantine: '@mantine/core Pagination', complexity: 'WRAP' },
    'Drawer': { mantine: '@mantine/core Drawer', complexity: 'WRAP' },
    'Sidebar': { mantine: '@mantine/core AppShell', complexity: 'WRAP', notes: 'Complex layout component' },
    // Custom components
    'StatusBadgeSelector': { mantine: '@mantine/core Menu + Badge', complexity: 'WRAP', notes: 'Custom wrapper using Menu and Badge' },
    'TableRowMenu': { mantine: '@mantine/core Menu + ActionIcon', complexity: 'WRAP', notes: 'Custom wrapper using Menu' },
    'SearchInput': { mantine: '@mantine/core TextInput + ActionIcon', complexity: 'WRAP', notes: 'Custom wrapper with search styling' },
    'EnhancedCheckbox': { mantine: '@mantine/core Checkbox', complexity: 'WRAP', notes: 'Enhanced with label and description' },
    'EnhancedTextarea': { mantine: '@mantine/core Textarea', complexity: 'WRAP', notes: 'Enhanced with validation states' }
  };
}

function scanDirectory(dir: string): ComponentUsage[] {
  const results: ComponentUsage[] = [];
  const componentUsage: Record<string, Set<string>> = {};
  const mapping = loadMigrationMapping();

  function scanFile(filePath: string) {
    // Skip free-trial directory
    if (filePath.includes('/free-trial/')) {
      return;
    }
    
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for shadcn/ui imports
    const shadcnImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;
    let match;
    
    while ((match = shadcnImportRegex.exec(content)) !== null) {
      const components = match[1].split(',').map(c => c.trim());
      
      components.forEach(component => {
        if (!componentUsage[component]) {
          componentUsage[component] = new Set();
        }
        componentUsage[component].add(filePath);
      });
    }

    // Check for Radix imports
    const radixImportRegex = /import\s+[^'"]*from\s+['"]@radix-ui\/([^'"]+)['"]/g;
    while ((match = radixImportRegex.exec(content)) !== null) {
      const radixComponent = `Radix-${match[1]}`;
      if (!componentUsage[radixComponent]) {
        componentUsage[radixComponent] = new Set();
      }
      componentUsage[radixComponent].add(filePath);
    }

    // Check for custom UI components that might use shadcn/ui internally
    const customComponentRegex = /import\s+[^'"]*from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;
    while ((match = customComponentRegex.exec(content)) !== null) {
      const component = match[1];
      if (!componentUsage[component]) {
        componentUsage[component] = new Set();
      }
      componentUsage[component].add(filePath);
    }
  }

  function walkDirectory(currentDir: string) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        walkDirectory(fullPath);
      } else if (stat.isFile()) {
        scanFile(fullPath);
      }
    }
  }

  walkDirectory(dir);

  // Convert to results format
  Object.entries(componentUsage).forEach(([component, files]) => {
    const fileArray = Array.from(files);
    const cleanComponent = component.replace(/^Radix-/, '');
    const mappingEntry = mapping[cleanComponent] || mapping[component];
    
    let mantineTarget = 'NEEDS-CONFIRMATION';
    let complexity: ComponentUsage['complexity'] = 'NEEDS-CONFIRMATION';
    let notes: string | undefined;
    
    if (mappingEntry) {
      mantineTarget = mappingEntry.mantine;
      complexity = mappingEntry.complexity;
      notes = mappingEntry.notes;
    }
    
    results.push({
      component,
      importPath: component.startsWith('Radix-') ? `@radix-ui/${component.slice(6)}` : `@/components/ui/${cleanComponent.toLowerCase()}`,
      files: fileArray,
      usageCount: fileArray.length,
      mantineTarget,
      complexity,
      notes
    });
  });

  return results.sort((a, b) => b.usageCount - a.usageCount);
}

function generateAuditReport(results: ComponentUsage[]): string {
  const date = new Date().toISOString().split('T')[0];
  const totalComponents = results.length;
  const directMatches = results.filter(r => r.complexity === 'DIRECT').length;
  const wraps = results.filter(r => r.complexity === 'WRAP').length;
  const needsConfirmation = results.filter(r => r.complexity === 'NEEDS-CONFIRMATION').length;
  
  let report = `# Mantine Component Audit - Phase 1\n\n`;
  report += `**Generated:** ${date}\n`;
  report += `**Scope:** Complete shadcn/ui, Radix UI, and custom component inventory\n`;
  report += `**Excluded:** /free-trial/ directory (preserves original styling)\n\n`;
  
  report += `## Executive Summary\n\n`;
  report += `- **Total Components:** ${totalComponents}\n`;
  report += `- **Direct Matches:** ${directMatches} (${Math.round(directMatches/totalComponents*100)}%)\n`;
  report += `- **Custom Wraps:** ${wraps} (${Math.round(wraps/totalComponents*100)}%)\n`;
  report += `- **Needs Confirmation:** ${needsConfirmation} (${Math.round(needsConfirmation/totalComponents*100)}%)\n\n`;
  
  // High-risk components
  const highRisk = results.filter(r => 
    r.component.includes('Table') || 
    r.component.includes('Dialog') || 
    r.component.includes('StatusBadge') ||
    r.usageCount > 10
  );
  
  if (highRisk.length > 0) {
    report += `## ⚠️ High-Risk Components\n\n`;
    report += `These components require careful migration planning:\n\n`;
    highRisk.forEach(comp => {
      report += `- **${comp.component}** (${comp.usageCount} files) → ${comp.mantineTarget}\n`;
      if (comp.notes) {
        report += `  - ${comp.notes}\n`;
      }
    });
    report += '\n';
  }
  
  report += `## Complete Component Mapping\n\n`;
  report += `| Component | Usage Count | Import Path | Mantine Target | Migration Type | Notes |\n`;
  report += `|-----------|-------------|-------------|----------------|----------------|-------|\n`;
  
  results.forEach(comp => {
    const notes = comp.notes || '';
    report += `| ${comp.component} | ${comp.usageCount} | \`${comp.importPath}\` | ${comp.mantineTarget} | ${comp.complexity} | ${notes} |\n`;
  });
  
  // Needs confirmation section
  const confirmationItems = results.filter(r => r.complexity === 'NEEDS-CONFIRMATION');
  if (confirmationItems.length > 0) {
    report += `\n## 🔍 Requires Confirmation\n\n`;
    report += `The following components need mapping confirmation:\n\n`;
    confirmationItems.forEach(comp => {
      report += `- **${comp.component}** (${comp.usageCount} files)\n`;
      report += `  - Path: \`${comp.importPath}\`\n`;
      report += `  - Files: ${comp.files.slice(0, 3).join(', ')}${comp.files.length > 3 ? '...' : ''}\n\n`;
    });
  }
  
  report += `## File Usage Details\n\n`;
  results.forEach(comp => {
    if (comp.usageCount > 0) {
      report += `### ${comp.component}\n\n`;
      report += `**Target:** ${comp.mantineTarget}  \n`;
      report += `**Migration:** ${comp.complexity}  \n`;
      if (comp.notes) {
        report += `**Notes:** ${comp.notes}  \n`;
      }
      report += `**Files (${comp.usageCount}):**\n\n`;
      comp.files.forEach(file => {
        report += `- ${file}\n`;
      });
      report += '\n';
    }
  });

  return report;
}

// Run the audit
console.log('🔍 Starting Phase 1 Component Audit...');
const results = scanDirectory('./src');
const report = generateAuditReport(results);

// Write the audit report
const reportPath = './docs/mantine_component_audit_phase1.md';
fs.writeFileSync(reportPath, report);

console.log(`\n✅ Phase 1 Audit Complete!`);
console.log(`📋 Report: ${reportPath}`);
console.log(`📊 Components: ${results.length}`);
console.log(`🎯 Direct: ${results.filter(r => r.complexity === 'DIRECT').length}`);
console.log(`🔧 Wraps: ${results.filter(r => r.complexity === 'WRAP').length}`);
console.log(`❓ Needs Confirmation: ${results.filter(r => r.complexity === 'NEEDS-CONFIRMATION').length}`);

export { scanDirectory, generateAuditReport };
