# Rollback Procedures for Needs Posting RLS Fix

**Branch:** `feat/needs-post-stabilize`  
**Commit:** `7248e9c`  
**Date:** 2025-09-14

## Summary of Changes Made
This fix addressed Row Level Security (RLS) errors in needs posting endpoints by:

1. **API Payload Updates:**
   - `/api/needs/route.ts`: Added `status: 'draft'`
   - `/api/needs/create/route.ts`: Changed `'review'` → `'pending'`
   - `/api/needs/new/route.ts`: Changed `published: false` → `status: 'draft'`

2. **Authentication Integration:**
   - Updated `src/lib/supabase/server.ts` to use async Clerk authentication
   - Modified API routes to use `await createClient()` instead of sync version

## Quick Rollback (Emergency)

If immediate rollback is needed due to critical issues:

```bash
# 1. Switch to main branch
git checkout main

# 2. If already merged, revert the merge commit
git revert -m 1 <merge_commit_hash>

# 3. Deploy immediately
npx vercel --prod --confirm
```

## Selective Rollback Options

### Option 1: Revert Only Authentication Changes
If the authentication integration causes issues but status field fixes are working:

```bash
# Create rollback branch
git checkout -b rollback/auth-only feat/needs-post-stabilize

# Revert only the auth changes
git revert --no-commit 7248e9c
git reset HEAD src/app/api/needs/route.ts src/app/api/needs/create/route.ts src/app/api/needs/new/route.ts
git commit -m "Revert auth changes only, keep status field fixes"
```

### Option 2: Revert Only Status Field Changes
If the status fields cause database constraint issues:

```bash
# Manually edit the files to revert status changes:
# - /api/needs/route.ts: Remove status: 'draft'
# - /api/needs/create/route.ts: Change back to status: 'review' 
# - /api/needs/new/route.ts: Change back to published: false
```

## Rollback Verification Steps

After rollback, verify:

1. **API Endpoints Work:**
   ```bash
   curl -X GET http://localhost:3000/api/needs
   # Should return {"needs": []} without errors
   ```

2. **Development Server Starts:**
   ```bash
   npm run dev
   # Should start without TypeScript errors
   ```

3. **Database Operations:**
   ```bash
   # Test database insert works (if applicable)
   # Check RLS policies are not blocking operations
   ```

## Potential Issues and Solutions

### Issue 1: TypeScript Compilation Errors
**Symptoms:** `createClient()` async/await errors
**Solution:**
```typescript
// In src/lib/supabase/server.ts, change back to:
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
```

### Issue 2: Database Constraint Violations  
**Symptoms:** `status` field constraint errors
**Solution:**
- Revert status field changes in API routes
- Or update database schema to allow the new values

### Issue 3: RLS Policy Conflicts
**Symptoms:** Users can't access their own posted needs
**Solution:**
- Check RLS policies in `supabase/migrations/20241215_rls_policies.sql`
- May need to update policies to handle draft status correctly

## Files Modified in This Fix

```
src/lib/supabase/server.ts
src/app/api/needs/route.ts  
src/app/api/needs/create/route.ts
src/app/api/needs/new/route.ts
```

## Testing After Rollback

1. Verify all needs posting forms work
2. Check authentication flows are unaffected
3. Confirm database operations complete successfully
4. Test RLS policies don't block legitimate operations

## Contact Information

- **Implementation Date:** 2025-09-14
- **Implemented By:** Claude Code
- **Original Issue:** RLS errors preventing needs posting
- **Branch:** feat/needs-post-stabilize

## Related Documentation

- RLS Policies: `supabase/migrations/20241215_rls_policies.sql`
- Database Schema: `supabase/migrations/20241214_need_status.sql`
- API Documentation: `CLAUDE.md`