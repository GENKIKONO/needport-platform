# Clerk Production User IDs Report

**Generated:** 2025-09-15  
**Environment:** Production (CLERK_SECRET_KEY: sk_test_RgRQnIqRKoICkAYUJVpC61KmhFTdPiY8VN2PzbYgiI)  
**Total Users Found:** 3

## 📋 User List

### 1. test@needport.dev
- **Clerk User ID:** `user_32iEPCzsCKGMHC5OPJj7sJm6Geh`
- **Name:** No name
- **Status:** Active
- **Created:** 2025-01-15T04:09:25.726Z
- **Role Assignment:** user

### 2. genkikono.2615@gmail.com ⭐ 
- **Clerk User ID:** `user_32bLa5iVBa4KBRldf4nRvKXLVnS`
- **Name:** 元気 河野
- **Status:** Active
- **Created:** 2025-01-13T03:19:45.531Z
- **Role Assignment:** admin (main account)
- **Last Sign In:** 2025-01-15T03:08:51.152Z

### 3. genkikono.kochi@gmail.com
- **Clerk User ID:** `user_32b0oVi0qqVcHfNOiXef4mCTwHd`
- **Name:** 元気 河野
- **Status:** Active  
- **Created:** 2025-01-13T00:28:59.418Z
- **Role Assignment:** user
- **Last Sign In:** 2025-01-13T00:29:19.433Z

## 📝 Generated SQL (Ready for Supabase)

```sql
-- For test@needport.dev:
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32iEPCzsCKGMHC5OPJj7sJm6Geh',
  'test@needport.dev',
  'Test User',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- For genkikono.2615@gmail.com:
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32bLa5iVBa4KBRldf4nRvKXLVnS',
  'genkikono.2615@gmail.com',
  '元気 河野',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- For genkikono.kochi@gmail.com:
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32b0oVi0qqVcHfNOiXef4mCTwHd',
  'genkikono.kochi@gmail.com',
  '元気 河野',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();
```

## 🔄 Updated Files

✅ **scripts/production/enable-auto-provisioning.sql** - Updated with actual Clerk User IDs  
✅ **scripts/production/get-clerk-user-ids.js** - Working script for user ID retrieval  

## 📋 JSON Format for API Integration

```json
{
  "test@needport.dev": {
    "id": "user_32iEPCzsCKGMHC5OPJj7sJm6Geh",
    "name": "Test User",
    "email": "test@needport.dev",
    "created_at": 1757894965726
  },
  "genkikono.2615@gmail.com": {
    "id": "user_32bLa5iVBa4KBRldf4nRvKXLVnS", 
    "name": "元気 河野",
    "email": "genkikono.2615@gmail.com",
    "created_at": 1757684385531
  },
  "genkikono.kochi@gmail.com": {
    "id": "user_32b0oVi0qqVcHfNOiXef4mCTwHd",
    "name": "元気 河野", 
    "email": "genkikono.kochi@gmail.com",
    "created_at": 1757674139418
  }
}
```

## 🚀 Next Steps

1. **Execute Migration:** Run `scripts/production/enable-auto-provisioning.sql` in Supabase SQL Editor
2. **Deploy to Vercel:** `npx vercel --prod --confirm`
3. **Test Posting:** Login and test `/needs/new` posting 
4. **Verify Results:** Use `scripts/production/post-deployment-test.sql` for verification

## ✅ Verification Points

- [ ] 3 profiles created in Supabase
- [ ] genkikono.2615@gmail.com has `role = 'admin'`
- [ ] Others have `role = 'user'`
- [ ] All Clerk User IDs match exactly
- [ ] Auto-provisioning works for new posts

---

**Status:** Ready for production deployment  
**Migration File:** `scripts/production/enable-auto-provisioning.sql` (updated with real IDs)