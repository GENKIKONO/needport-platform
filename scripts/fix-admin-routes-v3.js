#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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
  
  // Check if this file still has any unsafe patterns
  const hasUnsafeCalls = content.includes('supabaseAdmin()') || 
                         /createAdminClient[^O]/.test(content);
  
  if (hasUnsafeCalls) {
    console.log(`Fixing remaining unsafe calls in ${relPath}`);
    
    // Fix supabaseAdmin() function calls
    if (content.includes('supabaseAdmin()')) {
      // Replace supabaseAdmin() calls with safe pattern
      content = content.replace(
        /supabaseAdmin\(\)/g,
        'createAdminClientOrNull()!'
      );
      
      // Add null check after function definition if not present
      const functionMatch = content.match(/export async function (GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{/);
      if (functionMatch && !content.includes('createAdminClientOrNull()!')) {
        // If we replaced supabaseAdmin() calls, add the import and null check
        if (!content.includes('createAdminClientOrNull')) {
          content = content.replace(
            /import\s*{\s*supabaseAdmin\s*}\s*from\s*["']@\/lib\/supabase\/admin["'];?/g,
            'import { createAdminClientOrNull } from "@/lib/supabase/admin";'
          );
        }
        
        // Add null check after the function start
        const afterFunctionStart = content.indexOf('{', content.indexOf(functionMatch[0])) + 1;
        const nullCheckCode = `
  const admin = createAdminClientOrNull();
  if (!admin) {
    return NextResponse.json(
      { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
      { status: 503 }
    );
  }
  
`;
        
        if (!content.includes('createAdminClientOrNull()') || content.includes('createAdminClientOrNull()!')) {
          content = content.slice(0, afterFunctionStart) + nullCheckCode + content.slice(afterFunctionStart);
          // Replace createAdminClientOrNull()! calls with admin
          content = content.replace(/createAdminClientOrNull\(\)!/g, 'admin');
          modified = true;
        }
      }
    }
    
    // Ensure NextResponse is imported
    if (content.includes('NextResponse.json') && !content.includes('import { NextResponse }') && !content.includes('import { NextRequest, NextResponse }')) {
      if (content.includes('import { NextRequest }')) {
        content = content.replace(
          /import\s*{\s*NextRequest\s*}/,
          'import { NextRequest, NextResponse }'
        );
      } else {
        content = content.replace(
          /^(import.*)/m,
          'import { NextResponse } from "next/server";\n$1'
        );
      }
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} admin route files with remaining unsafe calls`);