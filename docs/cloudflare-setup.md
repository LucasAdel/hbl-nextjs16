# Cloudflare WAF/DDoS Setup Guide

## Overview

This guide configures Cloudflare as a reverse proxy in front of Netlify to provide:
- DDoS protection
- WAF (Web Application Firewall)
- Rate limiting at edge
- Bot protection
- SSL/TLS management

## Prerequisites

- Cloudflare account (Free tier is sufficient, Pro recommended)
- Access to domain DNS settings
- Netlify site deployed

## Phase 1: Add Domain to Cloudflare

### 1.1 Create Cloudflare Account
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Create account or log in
3. Click "Add a site"

### 1.2 Add Your Domain
1. Enter domain: `hamiltonbailey.com` (and `.com.au` if applicable)
2. Select plan:
   - **Free**: Basic DDoS, SSL, CDN
   - **Pro** ($20/mo): WAF, more rules, better analytics
3. Cloudflare will scan existing DNS records

### 1.3 Update Nameservers
Update your domain registrar to use Cloudflare nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

DNS propagation takes 24-48 hours.

## Phase 2: Configure DNS Records

### 2.1 CNAME Records for Netlify
In Cloudflare DNS dashboard, add:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | [your-site].netlify.app | Proxied (orange cloud) |
| CNAME | www | [your-site].netlify.app | Proxied (orange cloud) |

**Important**: Enable "Proxied" (orange cloud) for DDoS protection.

### 2.2 Verify DNS
```bash
dig +short hamiltonbailey.com
# Should show Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

## Phase 3: SSL/TLS Configuration

### 3.1 SSL Settings
Go to SSL/TLS → Overview:
- **Encryption mode**: Full (strict)
- This ensures end-to-end encryption

### 3.2 Edge Certificates
Go to SSL/TLS → Edge Certificates:
- **Always Use HTTPS**: ON
- **Minimum TLS Version**: 1.2
- **Opportunistic Encryption**: ON
- **TLS 1.3**: ON

### 3.3 HSTS (Strict Transport Security)
Enable HSTS:
- Max-Age: 12 months
- Include subdomains: Yes
- Preload: Yes (after testing)

## Phase 4: Security Settings

### 4.1 Basic Security
Go to Security → Settings:
- **Security Level**: Medium (increase to High if under attack)
- **Browser Integrity Check**: ON
- **Challenge Passage**: 30 minutes

### 4.2 Bot Fight Mode
Go to Security → Bots:
- **Bot Fight Mode**: ON (Free)
- **Super Bot Fight Mode**: ON (Pro)

### 4.3 Firewall Rules (Free tier: 5 rules)
Go to Security → WAF → Custom rules:

**Rule 1: Block Known Bad Bots**
```
(http.user_agent contains "sqlmap") or
(http.user_agent contains "nikto") or
(http.user_agent contains "nmap") or
(http.user_agent contains "masscan")
```
Action: Block

**Rule 2: Protect Admin Routes**
```
(http.request.uri.path contains "/admin" and not ip.src in {YOUR_OFFICE_IP})
```
Action: Challenge (or Block)

**Rule 3: Block Suspicious Query Strings**
```
(http.request.uri.query contains "UNION SELECT") or
(http.request.uri.query contains "<script>") or
(http.request.uri.query contains "../")
```
Action: Block

### 4.4 Rate Limiting (Pro tier)
Go to Security → WAF → Rate limiting rules:

**Rule 1: Auth endpoints**
```
URI Path: /api/auth/*
Requests: 10 per minute
Action: Block for 10 minutes
```

**Rule 2: API endpoints**
```
URI Path: /api/*
Requests: 100 per minute
Action: Challenge
```

## Phase 5: Page Rules (Optional)

### 5.1 Cache API Responses
```
URL: hamiltonbailey.com/api/codex/*
Setting: Cache Level = Cache Everything, Edge Cache TTL = 1 hour
```

### 5.2 Bypass Cache for Admin
```
URL: hamiltonbailey.com/admin/*
Setting: Cache Level = Bypass
```

## Phase 6: Emergency "Under Attack" Mode

If experiencing active DDoS attack:

1. Go to Security → Settings
2. Set Security Level to **I'm Under Attack!**
3. This shows a JS challenge to all visitors
4. Disable after attack subsides

## Monitoring

### Cloudflare Analytics
- Security → Overview: See blocked threats
- Analytics → Traffic: Monitor requests
- Analytics → Security: View attack patterns

### API Token (Already configured)
Your read-only API token is saved in `.env.local`:
```
CLOUDFLARE_API_TOKEN=TLeNuPfiPJevMxMhEwNxFWqFbt9vSZYi795-MnuQ
```

Use for monitoring via API:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

## Netlify Configuration

### Update netlify.toml
Add Cloudflare-compatible headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    # Allow Cloudflare to cache
    Cache-Control = "public, max-age=0, must-revalidate"
    # Trust Cloudflare's CF-Connecting-IP header
    X-Real-IP-From = "CF-Connecting-IP"
```

### Verify Cloudflare Headers
After setup, requests should include:
- `CF-Connecting-IP`: Original client IP
- `CF-IPCountry`: Country code
- `CF-Ray`: Request ID for debugging

## Testing Checklist

- [ ] Domain resolves to Cloudflare IPs
- [ ] HTTPS works with valid certificate
- [ ] HTTP redirects to HTTPS
- [ ] Netlify site loads correctly
- [ ] Admin routes are protected
- [ ] Bot Fight Mode blocks scanners
- [ ] Rate limiting triggers on excessive requests
- [ ] "Under Attack" mode works when enabled

## Troubleshooting

### 522 Error (Connection timed out)
- Netlify may be blocking Cloudflare IPs
- Check Netlify site is deployed and working

### 525 Error (SSL handshake failed)
- Change SSL mode to "Full" (not Strict) temporarily
- Verify Netlify SSL certificate is valid

### Redirect Loop
- Ensure SSL mode is "Full (strict)"
- Disable "Always Use HTTPS" temporarily to debug

---

*Last Updated: 2025-12-14*
