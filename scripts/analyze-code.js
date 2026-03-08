import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration specific to QTRIP
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.*\\.test\\.',
  '.*\\.spec\\.',
  '.*\\.d\\.ts$',
  'scripts'
];

const ANALYSIS_CATEGORIES = {
  DUPLICATE_FUNCTIONS: 'Duplicate Functions',
  DUPLICATE_COMPONENTS: 'Duplicate Components',
  OPTIMIZATION_CONFLICTS: 'Optimization Conflicts',
  STORE_CONFLICTS: 'Store Usage Conflicts',
  UNUSED_IMPORTS: 'Unused Imports',
  ROUTE_CONFLICTS: 'Route Conflicts',
};

async function findFiles(dir, pattern) {
  const files = await fs.readdir(dir);
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory() && !IGNORE_PATTERNS.includes(file)) {
      results.push(...await findFiles(filePath, pattern));
    } else if (file.match(pattern) && !IGNORE_PATTERNS.some(p => new RegExp(p).test(file))) {
      results.push(filePath);
    }
  }

  return results;
}

async function analyzeDuplicateFunctions(files) {
  const functionMap = new Map();
  const duplicates = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    // Match both regular functions and arrow functions
    const functionMatches = [
      ...(content.match(/function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}/g) || []),
      ...(content.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}/g) || [])
    ];

    for (const func of functionMatches) {
      const hash = func.replace(/\s+/g, ' ').trim();
      if (functionMap.has(hash)) {
        duplicates.push({
          function: func.split('{')[0].trim(),
          files: [functionMap.get(hash), file],
        });
      } else {
        functionMap.set(hash, file);
      }
    }
  }

  return duplicates;
}

async function analyzeOptimizationConflicts(files) {
  const conflicts = [];
  const optimizationPatterns = {
    managers: /class\s+\w*(?:Schedule|Optimization|AI)\w*Manager/,
    stores: /use\w*Store/,
    services: /class\s+\w*(?:Schedule|Optimization|AI)\w*Service/
  };

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    
    for (const [type, pattern] of Object.entries(optimizationPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        conflicts.push({
          type: `${type} Implementation`,
          file,
          match: matches[0],
        });
      }
    }
  }

  return conflicts;
}

async function analyzeStoreConflicts(files) {
  const conflicts = [];
  const storeUsages = new Map();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const storeMatches = content.match(/use\w*Store/g) || [];

    for (const store of storeMatches) {
      if (storeUsages.has(store)) {
        conflicts.push({
          store,
          files: [storeUsages.get(store), file],
          type: 'Multiple Store Usage'
        });
      } else {
        storeUsages.set(store, file);
      }
    }

    // Check for direct store mutations
    if (content.includes('.setState(') || content.includes('.getState()')) {
      conflicts.push({
        file,
        type: 'Direct Store Mutation',
        warning: 'Direct store mutations found. Consider using hooks instead.'
      });
    }
  }

  return conflicts;
}

async function analyzeUnusedImports(files) {
  const unused = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const imports = content.match(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"]/g) || [];

    for (const importStatement of imports) {
      const importedItems = importStatement.match(/{([^}]+)}/)[1].split(',').map(i => i.trim());
      for (const item of importedItems) {
        const cleanItem = item.split(' as ')[0].trim();
        if (!content.includes(cleanItem)) {
          unused.push({
            file,
            import: cleanItem,
            statement: importStatement,
          });
        }
      }
    }
  }

  return unused;
}

async function analyzeRouteConflicts(files) {
  const conflicts = [];
  const routeHandlers = new Map();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    
    // Check for route definitions
    const routeMatches = content.match(/path:\s*["']([^"']+)["']/g) || [];
    
    for (const route of routeMatches) {
      const routePath = route.match(/["']([^"']+)["']/)[1];
      if (routeHandlers.has(routePath)) {
        conflicts.push({
          route: routePath,
          files: [routeHandlers.get(routePath), file],
          type: 'Duplicate Route Definition'
        });
      } else {
        routeHandlers.set(routePath, file);
      }
    }
  }

  return conflicts;
}

async function analyzeCode() {
  console.log('Starting QTRIP codebase analysis...\n');

  const files = await findFiles('.', /\.(js|jsx|ts|tsx)$/);
  
  const results = {
    [ANALYSIS_CATEGORIES.DUPLICATE_FUNCTIONS]: await analyzeDuplicateFunctions(files),
    [ANALYSIS_CATEGORIES.OPTIMIZATION_CONFLICTS]: await analyzeOptimizationConflicts(files),
    [ANALYSIS_CATEGORIES.STORE_CONFLICTS]: await analyzeStoreConflicts(files),
    [ANALYSIS_CATEGORIES.UNUSED_IMPORTS]: await analyzeUnusedImports(files),
    [ANALYSIS_CATEGORIES.ROUTE_CONFLICTS]: await analyzeRouteConflicts(files),
  };

  // Generate report
  console.log('=== QTRIP Code Analysis Report ===\n');
  
  Object.entries(results).forEach(([category, items]) => {
    console.log(`\n${category}:`);
    console.log('-'.repeat(category.length + 1));
    
    if (items.length === 0) {
      console.log('No issues found.');
    } else {
      items.forEach((item, index) => {
        console.log(`\n${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
    }
  });

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    results,
  };

  await fs.writeFile(
    'code-analysis-report.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\nAnalysis complete. Report saved to code-analysis-report.json');
}

analyzeCode().catch(console.error); 