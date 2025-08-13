# Security Audit Report

## 1. Supabase RLS & Service Role Audit

### Current RLS Policies Status

#### ✅ **Properly Secured Tables**
- `mail_templates`: Admin-only access via service role
- `schedules`: Public read via token, admin write via service role
- `schedule_items`: Public read via join, admin write via service role
- `server_logs`: Admin-only access via service role

#### ⚠️ **Needs Review Tables**
- `needs`: Currently allows public read, needs `published=true` filter
- `offers`: Currently allows public read/write (too permissive)
- `prejoins`: Currently allows public read/write (too permissive)

### Service Role Usage Verification

#### ✅ **Correctly Using Service Role**
All admin APIs properly use `createAdminClient()`:
- `/api/admin/*` endpoints
- Export functions
- Backup operations
- Mail template management
- Health checks
- CSP reporting

#### ✅ **Public APIs Using Anon Client**
Public endpoints correctly use anon client:
- `/api/needs` (read-only)
- `/api/prejoins` (create only)
- `/api/search` (read-only)

### Required RLS Policy Updates

```sql
-- 1. Update needs table to require published=true for public read
DROP POLICY IF EXISTS "Anyone can view needs" ON needs;
CREATE POLICY "Public can view published needs" ON needs
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- 2. Restrict offers to read-only for public
DROP POLICY IF EXISTS "dev read offers" ON public.offers;
DROP POLICY IF EXISTS "dev insert offers" ON public.offers;

CREATE POLICY "Public can view offers" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (true);

-- Remove public insert policy - only admin can create offers
-- CREATE POLICY "Admin can manage offers" ON public.offers
--   FOR ALL TO service_role
--   USING (true)
--   WITH CHECK (true);

-- 3. Restrict prejoins to create-only for public
DROP POLICY IF EXISTS "Users can view own prejoins" ON prejoins;
DROP POLICY IF EXISTS "Users can create prejoins" ON prejoins;

CREATE POLICY "Public can create prejoins" ON prejoins
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admin can view all prejoins
CREATE POLICY "Admin can view prejoins" ON prejoins
  FOR SELECT TO service_role
  USING (true);
```

### Security Headers Implementation

#### ✅ **Implemented Headers**
- `Strict-Transport-Security`: max-age=31536000; includeSubDomains; preload
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Permissions-Policy`: geolocation=(), microphone=(), camera=()
- `Content-Security-Policy-Report-Only`: Active monitoring

#### 🔄 **CSP Enforcement Timeline**
1. **Day 1-24**: Report-Only mode active
2. **Day 25**: Review violations in `/admin/logs`
3. **Day 26**: Switch to enforced mode by changing header name

### Admin Authentication Security

#### ✅ **Enhanced Security**
- CSRF token validation
- Rate limiting (5 attempts per 15 minutes)
- Secure cookie settings (httpOnly, secure, sameSite=lax)
- 8-hour session timeout
- Proper error handling

#### 🔧 **Implementation Details**
- CSRF token generated server-side with crypto.randomBytes()
- Token stored in httpOnly cookie
- Form validation on both client and server
- Rate limiting integrated with existing system

## 2. Security Recommendations

### Immediate Actions
1. **Apply RLS Policy Updates**: Execute the SQL above in production
2. **Monitor CSP Reports**: Check `/admin/logs` for violations
3. **Test Admin Login**: Verify CSRF protection works

### Ongoing Monitoring
1. **Daily**: Check CSP violation logs
2. **Weekly**: Review admin access logs
3. **Monthly**: Audit service role usage

### Production Checklist
- [ ] RLS policies applied
- [ ] CSP monitoring active
- [ ] Admin authentication tested
- [ ] Rate limiting verified
- [ ] Security headers confirmed

## 3. Testing Commands

```bash
# Test RLS policies
curl -X GET "https://your-domain.com/api/needs" | jq '.items[] | select(.published == false)' | wc -l
# Should return 0 (no unpublished needs visible)

# Test admin authentication
curl -X POST "https://your-domain.com/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"pin":"wrong","csrfToken":"invalid"}' \
  -c cookies.txt
# Should return 403 Forbidden

# Test rate limiting
for i in {1..10}; do
  curl -X POST "https://your-domain.com/api/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"pin":"wrong","csrfToken":"invalid"}'
done
# Should return 429 after 5 attempts
```

## 4. Rollback Plan

If issues occur:
1. **CSP Issues**: Change header back to Report-Only
2. **RLS Issues**: Temporarily disable RLS on affected tables
3. **Auth Issues**: Revert to previous PIN-only system

Contact: support@needport.jp for security incidents.
