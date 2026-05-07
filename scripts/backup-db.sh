#!/bin/bash
# Backup automático do banco PostgreSQL via pg_dump no container Docker.
# Mantém os últimos 30 dias e comprime com gzip.

set -euo pipefail

CONTAINER="erp_joalheria_pg"
DB_USER="erp_user"
DB_NAME="erp_joalheria"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/erp}"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/erp_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup criado: $FILE ($(du -h "$FILE" | cut -f1))"

# Remove backups com mais de 30 dias
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
