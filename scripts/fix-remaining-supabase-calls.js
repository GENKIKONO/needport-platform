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
  
  // Check if this file still has supabaseAdmin() calls
  if (content.includes('supabaseAdmin()')) {
    console.log(`Fixing supabaseAdmin() calls in ${relPath}`);
    
    // Replace all supabaseAdmin() calls with createAdminClientOrNull() safe pattern
    content = content.replace(
      /supabaseAdmin\(\)/g,
      'createAdminClientOrNull()!'
    );
    
    // Add null checks in helper functions
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('createAdminClientOrNull()!')) {
        // Find the function containing this call
        let functionStart = i;
        while (functionStart >= 0 && !lines[functionStart].includes('function ') && !lines[functionStart].includes('=>')) {
          functionStart--;
        }
        
        if (functionStart >= 0) {
          // Find the opening brace
          let braceIndex = i;
          while (braceIndex < lines.length && !lines[braceIndex].includes('{')) {
            braceIndex++;
          }
          
          if (braceIndex < lines.length) {
            // Insert null check after the opening brace
            const nullCheck = [
              '  const admin = createAdminClientOrNull();',
              '  if (!admin) return false;'
            ];
            lines.splice(braceIndex + 1, 0, ...nullCheck);
            
            // Replace the createAdminClientOrNull()! call with admin
            for (let j = braceIndex + nullCheck.length + 1; j < lines.length; j++) {
              lines[j] = lines[j].replace(/createAdminClientOrNull\(\)!/g, 'admin');
              if (lines[j].includes('}') && !lines[j].includes('{')) {
                break; // End of function
              }
            }
            modified = true;
            break;
          }
        }
      }
    }
    
    content = lines.join('\n');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} admin route files with supabaseAdmin() calls`);