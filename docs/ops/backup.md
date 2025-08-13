# Backup & Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for the NeedPort platform, including database snapshots and storage exports.

## Database Backup

### Automated Backup (Recommended)

```bash
# Run automated backup
npm run backup:db
```

This command will:
1. Create a timestamped backup directory
2. Export database schema and data
3. Compress the backup
4. Upload to Supabase Storage (if configured)

### Manual Database Backup

#### Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Create database backup
supabase db dump --db-url "postgresql://postgres:[password]@[host]:5432/postgres" > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using connection string from environment
supabase db dump --db-url "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Using pg_dump directly

```bash
# Full database backup
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables only
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  --table=needs \
  --table=offers \
  --table=prejoins \
  --table=server_logs \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --file=backup_tables_$(date +%Y%m%d_%H%M%S).sql
```

## Storage Backup

### Supabase Storage Export

```bash
# Export all storage buckets
supabase storage download --project-ref [PROJECT_REF] --bucket attachments --local-path ./backup/storage/attachments

# Or using the backup script
npm run backup:storage
```

### Manual Storage Backup

```bash
# Create backup directory
mkdir -p backup/storage/$(date +%Y%m%d_%H%M%S)

# Download attachments bucket
curl -X GET \
  "https://[PROJECT_REF].supabase.co/storage/v1/object/list/attachments" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  | jq -r '.[] | .name' \
  | xargs -I {} curl -X GET \
    "https://[PROJECT_REF].supabase.co/storage/v1/object/public/attachments/{}" \
    -o "backup/storage/$(date +%Y%m%d_%H%M%S)/{}"
```

## Backup Scripts

### Database Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

set -e

# Configuration
BACKUP_DIR="./backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"
COMPRESSED_FILE="backup_${DATE}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable not set"
    exit 1
fi

echo "Creating database backup..."

# Create backup
pg_dump "$DATABASE_URL" \
  --verbose \
  --clean \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "Backup created: $BACKUP_DIR/$COMPRESSED_FILE"

# Optional: Upload to Supabase Storage
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -n "$SUPABASE_URL" ]; then
    echo "Uploading backup to Supabase Storage..."
    # Upload logic here
fi

echo "Backup completed successfully"
```

### Storage Backup Script

```bash
#!/bin/bash
# scripts/backup-storage.sh

set -e

# Configuration
BACKUP_DIR="./backups/storage"
DATE=$(date +%Y%m%d_%H%M%S)
STORAGE_DIR="$BACKUP_DIR/$DATE"

# Create backup directory
mkdir -p "$STORAGE_DIR"

echo "Creating storage backup..."

# Download attachments bucket
if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -n "$SUPABASE_URL" ]; then
    # Use Supabase CLI or direct API calls
    echo "Storage backup completed: $STORAGE_DIR"
else
    echo "Warning: Supabase credentials not configured, skipping storage backup"
fi
```

## Recovery Procedures

### Database Recovery

#### From SQL Backup

```bash
# Restore from backup file
psql "$DATABASE_URL" < backup_20241220_143022.sql

# Or if compressed
gunzip -c backup_20241220_143022.sql.gz | psql "$DATABASE_URL"
```

#### From Supabase CLI

```bash
# Restore using Supabase CLI
supabase db reset --db-url "$DATABASE_URL"
psql "$DATABASE_URL" < backup_file.sql
```

### Storage Recovery

```bash
# Upload files back to storage
for file in backup/storage/20241220_143022/*; do
    curl -X POST \
      "https://[PROJECT_REF].supabase.co/storage/v1/object/attachments/$(basename $file)" \
      -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
      -H "Content-Type: application/octet-stream" \
      --data-binary "@$file"
done
```

## Backup Schedule

### Recommended Schedule

- **Daily**: Automated database backup (retain 7 days)
- **Weekly**: Full backup including storage (retain 4 weeks)
- **Monthly**: Complete system backup (retain 12 months)

### Automated Backup Setup

#### Using Cron (Linux/macOS)

```bash
# Add to crontab
0 2 * * * cd /path/to/needport-platform && npm run backup:db >> /var/log/backup.log 2>&1
0 3 * * 0 cd /path/to/needport-platform && npm run backup:full >> /var/log/backup.log 2>&1
```

#### Using GitHub Actions

```yaml
# .github/workflows/backup.yml
name: Automated Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run backup:db
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Verification

### Backup Verification

```bash
# Verify database backup
pg_restore --list backup_file.sql | head -20

# Verify storage backup
ls -la backup/storage/20241220_143022/ | wc -l
```

### Recovery Testing

```bash
# Test recovery in staging environment
npm run backup:test-recovery
```

## Emergency Procedures

### Complete System Recovery

1. **Stop the application**
2. **Restore database from latest backup**
3. **Restore storage files**
4. **Verify data integrity**
5. **Restart the application**

### Partial Recovery

```bash
# Recover specific tables
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS needs CASCADE;"
psql "$DATABASE_URL" < backup_needs_only.sql

# Recover specific files
curl -X POST \
  "https://[PROJECT_REF].supabase.co/storage/v1/object/attachments/important-file.pdf" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@backup/important-file.pdf"
```

## Monitoring

### Backup Monitoring

- Monitor backup script execution logs
- Set up alerts for failed backups
- Verify backup file sizes and timestamps
- Test recovery procedures regularly

### Health Checks

```bash
# Check backup health
npm run backup:health

# Verify backup integrity
npm run backup:verify
```

## Security Considerations

- Store backup files securely
- Encrypt sensitive backup data
- Use secure transfer protocols
- Implement backup access controls
- Regularly rotate backup credentials

## Troubleshooting

### Common Issues

1. **Backup fails due to disk space**
   - Clean up old backups
   - Increase disk space
   - Use compression

2. **Database connection timeout**
   - Increase connection timeout
   - Use smaller backup chunks
   - Schedule during low-traffic periods

3. **Storage upload failures**
   - Check network connectivity
   - Verify API credentials
   - Retry with exponential backoff

### Support

For backup-related issues, contact:
- Email: support@needport.jp
- Include backup logs and error messages
- Specify the backup type and timestamp
