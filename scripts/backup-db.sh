#!/bin/bash

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
