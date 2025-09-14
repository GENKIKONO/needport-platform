# Database Migration Instructions - Collective Demand Feature

## 🚨 MIGRATION REQUIRED

The collective demand visualization feature requires database schema changes. Since direct PostgreSQL connections to Supabase are restricted, you need to apply the migration manually through the Supabase Dashboard.

## Migration Steps

### 1. Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select the NeedPort project (`chmtfxaebzbejvbnvird`)

### 2. Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New query" or use the existing query editor

### 3. Execute Migration SQL

Copy and paste the following SQL migration code into the SQL Editor:

```sql
-- 002-collective-demand.sql
-- Collective Demand Visualization (Lv1)
-- Adds threshold_pledge, need_engagements, and need_anonymous_interest tables

-- 0) Ensure pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add threshold_pledge column to existing needs table
ALTER TABLE public.needs
  ADD COLUMN IF NOT EXISTS threshold_pledge integer NOT NULL DEFAULT 5;

-- 2) Create engagement_kind enum
DO $$ 
BEGIN
  CREATE TYPE engagement_kind AS ENUM ('interest', 'pledge');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3) Create need_engagements table for logged-in user reactions
CREATE TABLE IF NOT EXISTS public.need_engagements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id    uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,   -- references profiles.id (Clerk bridge)
  kind       engagement_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (need_id, user_id, kind)
);

-- 4) Create need_anonymous_interest table for anonymous reactions
CREATE TABLE IF NOT EXISTS public.need_anonymous_interest (
  id         bigserial PRIMARY KEY,
  need_id    uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  anon_key   text NOT NULL,    -- sha256(IP+UA+salt) hash
  day        date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (need_id, anon_key, day)
);

-- 5) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_need_engagements_need_id ON public.need_engagements(need_id);
CREATE INDEX IF NOT EXISTS idx_need_engagements_user_id ON public.need_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_need_anonymous_interest_need_id ON public.need_anonymous_interest(need_id);
CREATE INDEX IF NOT EXISTS idx_need_anonymous_interest_day ON public.need_anonymous_interest(day);

-- 6) Enable RLS (Row Level Security)
ALTER TABLE public.need_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.need_anonymous_interest ENABLE ROW LEVEL SECURITY;

-- 7) RLS Policies for need_engagements
DROP POLICY IF EXISTS "insert own engagement" ON public.need_engagements;
CREATE POLICY "insert own engagement"
  ON public.need_engagements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "update own engagement" ON public.need_engagements;
CREATE POLICY "update own engagement"
  ON public.need_engagements FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "delete own engagement" ON public.need_engagements;
CREATE POLICY "delete own engagement"
  ON public.need_engagements FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "read engagements" ON public.need_engagements;
CREATE POLICY "read engagements"
  ON public.need_engagements FOR SELECT TO anon, authenticated
  USING (true);

-- 8) RLS Policies for need_anonymous_interest
DROP POLICY IF EXISTS "insert anon interest" ON public.need_anonymous_interest;
CREATE POLICY "insert anon interest"
  ON public.need_anonymous_interest FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "read anon interest" ON public.need_anonymous_interest;
CREATE POLICY "read anon interest"
  ON public.need_anonymous_interest FOR SELECT TO anon, authenticated
  USING (true);

-- 9) Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
```

### 4. Run the Migration
1. Click the "Run" button (▶️) to execute the SQL
2. Wait for the query to complete
3. Check for any error messages in the results panel

### 5. Verify Migration Success

After running the migration, verify it worked by running this test query:

```sql
-- Test query to verify migration
SELECT 
  id, 
  title, 
  threshold_pledge,
  created_at 
FROM public.needs 
LIMIT 1;
```

If the query runs without errors and shows the `threshold_pledge` column, the migration was successful.

## After Migration

Once the migration is complete:

### 1. Test the Schema
Run the schema test script:
```bash
npm run test:schema
```

### 2. Restart Development Server
The development server will automatically pick up the new schema. If you see any cache issues:
```bash
# Kill the dev server and restart
npm run dev
```

### 3. Test Engagement APIs
The following endpoints should now work:
- `GET /api/needs/{id}/engagement/summary` - Get engagement counts
- `POST /api/needs/{id}/engagement` - Record engagement
- `DELETE /api/needs/{id}/engagement` - Remove engagement
- `GET /api/needs/{id}/engagement/user` - Get user's engagement status

### 4. Test UI Components
Visit any need page and you should see:
- Engagement buttons (anonymous "気になる" or authenticated "興味あり/購入したい")
- Progress meter showing collective demand
- Business viability indicators

## Troubleshooting

### Common Issues

**Error: "column needs.threshold_pledge does not exist"**
- The migration hasn't been applied yet. Follow steps 1-4 above.

**Error: "relation need_engagements does not exist"**
- The migration was partially applied. Re-run the complete migration SQL.

**RLS Policy Errors**
- These are normal if policies already exist. The `DROP POLICY IF EXISTS` statements handle this.

### Environment Variables

Make sure these environment variables are set in `.env.local`:

```env
# Required for engagement system
ANON_SALT=needport-anonymous-engagement-salt-change-in-production-12345
ANON_RATE_LIMIT=10
```

### Help Commands

```bash
# Test if schema is ready
npm run test:schema

# Attempt automated migration (usually fails, but shows status)
npm run db:migrate

# Check development server logs
npm run dev
```

## What This Migration Adds

1. **threshold_pledge column** - Configurable threshold for business viability (default: 5)
2. **need_engagements table** - Authenticated user reactions (interest/pledge)
3. **need_anonymous_interest table** - Anonymous "気になる" reactions with daily deduplication
4. **RLS Policies** - Row-level security for data protection
5. **Performance indexes** - Optimized queries for engagement data
6. **engagement_kind enum** - Type safety for engagement types

After successful migration, the collective demand visualization feature will be fully functional!