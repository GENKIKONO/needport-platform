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
  const relPath = filePath.replace(adminApiDir, '');
  
  // Check for unsafe patterns that need fixing
  const needsFixing = 
    (content.includes('createAdminClient') && !content.includes('createAdminClientOrNull')) ||
    content.includes('supabaseAdmin') ||
    !content.includes('export const dynamic');

  if (needsFixing) {
    console.log(`Fixing ${relPath}`);
    
    // 1. Replace unsafe supabaseAdmin imports
    if (content.includes('supabaseAdmin')) {
      content = content.replace(
        /import\s*{\s*supabaseAdmin\s*}\s*from\s*["']@\/lib\/supabase\/admin["'];?/g,
        'import { createAdminClientOrNull } from "@/lib/supabase/admin";'
      );
      
      // Replace supabaseAdmin() calls with safe pattern
      content = content.replace(
        /const\s+(\w+)\s*=\s*supabaseAdmin\(\);?/g,
        (match, varName) => {
          return `const ${varName} = createAdminClientOrNull();
    
    if (!${varName}) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }`;
        }
      );
      modified = true;
    }
    
    // 2. Replace createAdminClient imports
    if (content.includes('createAdminClient') && !content.includes('createAdminClientOrNull')) {
      content = content.replace(
        /import\s*{\s*createAdminClient\s*}\s*from\s*["']@\/lib\/supabase\/server["'];?/g,
        'import { createAdminClientOrNull } from "@/lib/supabase/server";'
      );
      
      content = content.replace(
        /import\s*{\s*createAdminClient\s*}\s*from\s*["']@\/lib\/supabase\/admin["'];?/g,
        'import { createAdminClientOrNull } from "@/lib/supabase/admin";'
      );
      
      // Replace createAdminClient() calls with null check pattern
      content = content.replace(
        /const\s+(\w+)\s*=\s*createAdminClient\(\);?/g,
        (match, varName) => {
          return `const ${varName} = createAdminClientOrNull();
    
    if (!${varName}) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }`;
        }
      );
      modified = true;
    }
    
    // 3. Add dynamic export flags if not present
    if (!content.includes('export const dynamic')) {
      // Find insertion point after imports
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Find last import line
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      
      // Skip empty lines and comments after imports
      while (insertIndex < lines.length && 
             (lines[insertIndex].trim() === '' || lines[insertIndex].trim().startsWith('//'))) {
        insertIndex++;
      }
      
      const dynamicExports = [
        '',
        '// Force dynamic rendering to avoid build-time env access',
        "export const dynamic = 'force-dynamic';",
        "export const revalidate = 0;",
        "export const fetchCache = 'force-no-store';",
        "export const runtime = 'nodejs';",
        ''
      ];
      
      lines.splice(insertIndex, 0, ...dynamicExports);
      content = lines.join('\n');
      modified = true;
    }
    
    // 4. Ensure NextResponse is imported if we added null checks
    if (content.includes('NextResponse.json') && !content.includes('NextResponse')) {
      // Add NextResponse import if missing
      const firstImportMatch = content.match(/^import.*from/m);
      if (firstImportMatch) {
        const importLine = firstImportMatch[0];
        if (importLine.includes('NextRequest')) {
          content = content.replace(
            /import\s*{\s*NextRequest\s*}/,
            'import { NextRequest, NextResponse }'
          );
        } else {
          content = content.replace(
            /^import/m,
            'import { NextResponse } from "next/server";\nimport'
          );
        }
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} admin route files`);