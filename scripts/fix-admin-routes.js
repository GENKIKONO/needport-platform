#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all admin API route files
const adminApiDir = path.join(__dirname, '../src/app/api/admin');

function findRouteFiles(dir) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

const routeFiles = findRouteFiles(adminApiDir);
console.log(`Found ${routeFiles.length} admin route files`);

let fixedCount = 0;

for (const filePath of routeFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if this file imports createAdminClient and needs fixing
  if (content.includes('createAdminClient') && !content.includes('createAdminClientOrNull')) {
    console.log(`Fixing ${filePath.replace(adminApiDir, '')}`);
    
    // Replace imports
    content = content.replace(
      /import\s*{[^}]*createAdminClient[^}]*}\s*from\s*["']@\/lib\/supabase\/server["'];?/g,
      'import { createAdminClientOrNull } from "@/lib/supabase/server";'
    );
    
    content = content.replace(
      /import\s*{[^}]*createAdminClient[^}]*}\s*from\s*["']@\/lib\/supabase\/admin["'];?/g,
      'import { createAdminClientOrNull } from "@/lib/supabase/admin";'
    );
    
    // Add dynamic export flags if not present
    if (!content.includes('export const dynamic')) {
      const importEnd = content.lastIndexOf('import ');
      const importLine = content.indexOf('\n', importEnd);
      
      const dynamicExports = `
// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
`;
      
      content = content.slice(0, importLine + 1) + dynamicExports + content.slice(importLine + 1);
      modified = true;
    }
    
    // Replace createAdminClient() calls with null check pattern
    const oldClientPattern = /const\s+(\w+)\s*=\s*createAdminClient\(\);?/g;
    content = content.replace(oldClientPattern, (match, varName) => {
      return `const ${varName} = createAdminClientOrNull();
    
    if (!${varName}) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }`;
    });
    
    if (content.includes('createAdminClientOrNull')) {
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} admin route files`);