# NeedPort Platform

A modern platform for connecting needs with solutions, built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL (via Supabase)
- SMTP server (for email notifications)

## 🔧 Environment Configuration

### Required Environment Variables

#### Core Configuration
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin
ADMIN_PIN=your_secure_pin

# Email
MAIL_FROM=noreply@needport.jp
MAIL_TO_OWNER=admin@needport.jp
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

#### Optional Configuration
```bash
# Feature Flags
NEXT_PUBLIC_DEMO_MODE=false
FF_MAINTENANCE=false
NEXT_PUBLIC_STRIPE_ENABLED=false

# Security
HOOK_SECRET=your_webhook_secret

# Legal
LEGAL_COMPANY_NAME=Your Company Name
LEGAL_ADDRESS=Your Company Address
LEGAL_CONTACT=Your Contact Info
LEGAL_REP=Your Representative
LEGAL_SUPPORT_EMAIL=support@needport.jp
```

### Environment Matrix

| Environment | NODE_ENV | NEXT_PUBLIC_APP_ENV | Robots.txt | Debug Endpoints | Demo Mode |
|-------------|----------|---------------------|------------|-----------------|-----------|
| Development | development | development | Disallow | Enabled | Optional |
| Staging | production | staging | Disallow | Disabled | Optional |
| Production | production | production | Allow | Disabled | Disabled |

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Quality Assurance
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript checks
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run end-to-end tests
npm run preflight       # Run all checks (lint + typecheck + test)

# Testing
npm run smoke           # Run smoke tests (Need Scale feature)
npm run smoke:schedule  # Run schedule smoke tests
npm run seed:scale      # Seed sample data for scale feature
npm run smoke:scale     # Run scale feature smoke tests

### Smoke test

ローカルで一括確認:
```bash
npm run smoke
# ブラウザ表示: http://localhost:3000/admin/smoke
```

CI で使う場合:
```bash
npm run smoke:ci
# もしくは
ADMIN_COOKIE='sb:token=...' npm run smoke:ci
```

### Troubleshooting

#### VS Code / Cursor でターミナルが固まる（pty host unresponsive）
1. バナーの「Restart Pty Host」を押す  
2. 直らない場合：全ターミナル Kill → 新規ターミナル  
3. それでも×：Command Palette → "Developer: Reload Window"
4. ポート競合時：`lsof -i :3000 -sTCP:LISTEN -t | xargs kill -9`

# Backup & Recovery
npm run backup:db       # Create database backup
npm run backup:storage  # Create storage backup
npm run backup:full     # Create full backup
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Vitest** for unit testing
- **Playwright** for E2E testing

### Security Features

- **CSRF Protection** on admin forms
- **Rate Limiting** on sensitive endpoints
- **CSP Headers** for XSS protection
- **RLS Policies** for database security
- **Production Guards** on debug endpoints

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables from the environment matrix

3. **Deploy**
   ```bash
   git push origin main
   ```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Security headers active
- [ ] CSP monitoring enabled
- [ ] Backup procedures tested
- [ ] Health checks passing

### Development Notes

#### Scale Feature Testing

```bash
# Test personal need creation
curl -X POST http://localhost:3000/api/needs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "個人ブログのデザイン改善",
    "summary": "現在のブログが古く、スマホ対応もできていないため、新しいデザインで集客力を上げたい。",
    "scale": "personal",
    "agree": true
  }'

# Test community need creation
curl -X POST http://localhost:3000/api/needs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "地域イベントのWebサイト制作",
    "summary": "年2回開催する地域イベントのWebサイトを制作したい。",
    "scale": "community",
    "macro_fee_hint": "上限50万円",
    "macro_use_freq": "年2回のイベント",
    "macro_area_hint": "高知県内",
    "agree": true
  }'
```

## 📊 Monitoring

### Health Endpoints

- `/api/health` - Load balancer health check (no auth required)
- `/api/ready` - Detailed health check (admin auth required)

### Logging

- Application logs: Vercel Function Logs
- Database logs: Supabase Dashboard
- Security logs: `/admin/logs` (admin only)

## 🔒 Security

### Security Headers

The application includes comprehensive security headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`

### Database Security

- Row Level Security (RLS) enabled on all tables
- Service role used for admin operations only
- Public access restricted to published content only

### Authentication

- Admin authentication via secure PIN
- CSRF token validation
- Rate limiting on login attempts
- Secure cookie configuration

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin pages
│   ├── api/            # API routes
│   ├── needs/          # Public need pages
│   └── ...
├── components/         # React components
├── lib/               # Utility libraries
│   ├── server/        # Server-side utilities
│   ├── client/        # Client-side utilities
│   └── ...
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run preflight`
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Email: support@needport.jp
- Documentation: `/admin/docs`
- Health Status: `/api/health`
