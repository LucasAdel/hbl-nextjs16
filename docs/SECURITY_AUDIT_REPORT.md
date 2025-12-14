# Security Audit Report - Hamilton Bailey Legal

**Date:** 2025-12-14
**Site:** https://hbl-law-staging.netlify.app
**Status:** Production Ready with Recommendations

---

## Executive Summary

Your application has a **strong security foundation** with most critical protections in place. This report identifies completed security measures and recommends additional hardening.

| Category | Score | Status |
|----------|-------|--------|
| HTTP Security Headers | 9/10 | ✅ Excellent |
| Authentication & Authorization | 8/10 | ✅ Good |
| API Security | 8/10 | ✅ Good |
| Data Protection | 7/10 | ⚠️ Room for improvement |
| Infrastructure | 7/10 | ⚠️ Room for improvement |

---

## ✅ Completed Security Measures

### HTTP Security Headers (Excellent)

| Header | Value | Status |
|--------|-------|--------|
| Content-Security-Policy | Comprehensive policy | ✅ |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | ✅ |
| X-Frame-Options | DENY | ✅ |
| X-Content-Type-Options | nosniff | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | ✅ |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | ✅ |

### Authentication & Authorization

| Feature | Implementation | Status |
|---------|---------------|--------|
| IDOR Prevention | Stripe session ownership verification | ✅ |
| Role-based Access | Strict equality checks (no `.includes()`) | ✅ |
| Admin Authentication | `requireAdminAuth()` on all admin endpoints | ✅ |
| JWT Validation | Supabase handles server-side | ✅ |
| Session Management | Supabase Auth with PKCE flow | ✅ |

### API Security

| Feature | Implementation | Status |
|---------|---------------|--------|
| Rate Limiting | 5 req/min on payments, 20-30 on chat | ✅ |
| Webhook Idempotency | `webhook_events` table prevents duplicates | ✅ |
| Input Validation | Zod schemas on API routes | ✅ |
| CSRF Protection | Infrastructure in place (`lib/csrf/`) | ✅ |
| Audit Logging | `audit_logs` table for security events | ✅ |

### Code Security

| Feature | Implementation | Status |
|---------|---------------|--------|
| TypeScript | Strict mode enabled | ✅ |
| SQL Injection | Supabase parameterized queries | ✅ |
| XSS Prevention | React auto-escaping + DOMPurify available | ✅ |
| Secrets Management | Environment variables only | ✅ |

---

## ⚠️ Recommended Improvements

### Priority 1: Critical (Implement This Week)

#### 1. Fix npm Dependency Vulnerability

```bash
npm audit fix
```

**Current Issue:** 1 high severity vulnerability in `jws` package (netlify-cli dependency)

#### 2. Add Subresource Integrity (SRI) for External Scripts

External scripts (Stripe, Google Analytics) should have integrity hashes.

```typescript
// next.config.ts
experimental: {
  sri: {
    algorithm: 'sha384',
  },
},
```

#### 3. Implement API Key Rotation Schedule

Create a rotation schedule for:
- `STRIPE_SECRET_KEY` - Rotate quarterly
- `STRIPE_WEBHOOK_SECRET` - Rotate quarterly
- `SUPABASE_SERVICE_ROLE_KEY` - Rotate annually
- `RESEND_API_KEY` - Rotate annually
- `ANTHROPIC_API_KEY` - Rotate annually

### Priority 2: High (Implement This Month)

#### 4. Add Two-Factor Authentication for Admin

```typescript
// Require 2FA for admin routes
if (user.role === 'admin' && !user.mfa_verified) {
  return redirect('/admin/verify-2fa');
}
```

**Implementation:**
- Enable Supabase MFA (TOTP)
- Require for all admin role users
- Add recovery codes

#### 5. Implement Session Timeout

```typescript
// lib/supabase/client.ts
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  storage: {
    // Session expires after 4 hours of inactivity
    getItem: (key) => {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const { value, timestamp } = JSON.parse(item);
      if (Date.now() - timestamp > 4 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    },
  },
}
```

#### 6. Add IP-Based Rate Limiting for Admin

```typescript
// proxy.ts - Add stricter limits for admin
if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
  const adminLimit = await ratelimit.limit(`admin-${ip}`, {
    limit: 100,
    window: '15m',
  });
  if (!adminLimit.success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

#### 7. Enable Supabase Row-Level Security Audit

```sql
-- Run this query to find tables without RLS
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies WHERE schemaname = 'public'
);
```

### Priority 3: Medium (Implement This Quarter)

#### 8. Set Up Security Monitoring (SIEM)

**Option A: Sentry Security Features**
- Already have Sentry installed
- Enable Security Insights
- Set up alerts for:
  - 401/403 spikes
  - Rate limit triggers
  - Unusual API patterns

**Option B: Supabase Logs**
```sql
-- Monitor failed auth attempts
SELECT * FROM auth.audit_log_entries
WHERE payload->>'action' = 'login'
AND payload->>'success' = 'false'
ORDER BY created_at DESC;
```

#### 9. Implement Content Security Policy Reporting

```typescript
// netlify.toml - Add CSP reporting
Content-Security-Policy-Report-Only = "... report-uri https://your-endpoint.com/csp-report"
```

#### 10. Add Security.txt

Create `public/.well-known/security.txt`:

```
Contact: mailto:security@hamiltonbailey.com.au
Expires: 2026-12-31T23:59:00.000Z
Preferred-Languages: en
Canonical: https://hamiltonbailey.com.au/.well-known/security.txt
```

#### 11. Enable Cloudflare WAF (if using Cloudflare)

- Enable managed rulesets
- Block known bot patterns
- Geographic restrictions (Australia-only for admin?)
- Challenge suspicious requests

#### 12. Implement Account Lockout

```typescript
// After 5 failed login attempts, lock for 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

async function checkLockout(email: string): Promise<boolean> {
  const attempts = await redis.get(`login_attempts:${email}`);
  return attempts >= MAX_ATTEMPTS;
}
```

### Priority 4: Low (Nice to Have)

#### 13. Penetration Testing

Consider annual penetration testing from:
- Bugcrowd
- HackerOne
- Local Australian security firms

#### 14. SOC 2 Compliance Preparation

If handling sensitive legal data, consider:
- Access logging (partially done with audit_logs)
- Data encryption at rest (Supabase handles)
- Incident response plan
- Security awareness training

#### 15. Add Security Headers Testing to CI

```bash
# Add to test suite
npx security-headers https://hbl-law-staging.netlify.app
```

---

## Security Checklist for Deployments

Before each production deployment:

- [ ] `npm audit` shows 0 high/critical vulnerabilities
- [ ] No secrets in code (grep for API keys)
- [ ] Rate limiting tested on new endpoints
- [ ] Admin routes have authentication
- [ ] User input sanitized (Zod validation)
- [ ] IDOR prevention on data-fetching endpoints
- [ ] Audit log entries for sensitive operations

---

## Incident Response Plan

### If You Suspect a Breach:

1. **Immediate (0-1 hour)**
   - Rotate all API keys
   - Review Supabase auth logs
   - Check Sentry for unusual errors

2. **Short-term (1-24 hours)**
   - Audit user sessions
   - Review webhook_events for anomalies
   - Check audit_logs for unauthorized access

3. **Communication**
   - Notify affected users within 72 hours (GDPR/Australian Privacy Act)
   - Document incident timeline

---

## Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Australian Privacy Act](https://www.oaic.gov.au/privacy/the-privacy-act)

---

**Report Generated:** 2025-12-14
**Next Review:** 2026-03-14 (Quarterly)
