#!/bin/bash
# Daily backup script for Farmatour5
# Backs up PostgreSQL database and application files

BACKUP_DIR="/var/www/farmatour5/database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/var/www/farmatour5/logs/backup.log"
DB_USER="farmatour5"
DB_NAME="farmatour5"

mkdir -p $BACKUP_DIR

{
  echo "====== Backup Started: $(date) ======"
  
  # Database backup
  echo "Backing up database..."
  pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/farmatour5_db_$TIMESTAMP.dump 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Database backed up: $BACKUP_DIR/farmatour5_db_$TIMESTAMP.dump"
  else
    echo "❌ Database backup failed"
    exit 1
  fi
  
  # Application files backup (optional, for configuration)
  echo "Backing up application config..."
  tar -czf $BACKUP_DIR/farmatour5_config_$TIMESTAMP.tar.gz \
    /var/www/farmatour5/.env 2>/dev/null || true
  
  # Cleanup old backups (keep last 30 days)
  echo "Cleaning up old backups..."
  find $BACKUP_DIR -mtime +30 -delete
  
  # Verify backup
  if [ -f "$BACKUP_DIR/farmatour5_db_$TIMESTAMP.dump" ]; then
    SIZE=$(du -h $BACKUP_DIR/farmatour5_db_$TIMESTAMP.dump | cut -f1)
    echo "✅ Backup successful - Size: $SIZE"
    exit_code=0
  else
    echo "❌ Backup verification failed"
    exit_code=1
  fi
  
  echo "====== Backup Completed: $(date) ======"
  
  exit $exit_code
  
} >> $LOG_FILE 2>&1
