#!/usr/bin/env bash
# =============================================================================
# scripts/backup-restore-drill.sh
# Manual pg_dump → pg_restore drill for Supabase free-tier projects.
#
# Usage:
#   chmod +x scripts/backup-restore-drill.sh
#   set -a; source .env.local; set +a
#   ./scripts/backup-restore-drill.sh
# =============================================================================

set -euo pipefail

DUMP_FILE="neet_coach_backup_$(date +%Y%m%d%H%M%S).dump"
DRILL_ID=$(date +%Y%m%d%H%M%S)

echo ""
echo "=========================================="
echo "  NEET Coach — Backup Restore Drill"
echo "  Drill ID: $DRILL_ID"
echo "=========================================="

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL is not set"; exit 1
fi
if [[ -z "${STAGING_DATABASE_URL:-}" ]]; then
  echo "❌ STAGING_DATABASE_URL is not set."; echo "   Create a separate Supabase project and paste its DATABASE_URL."; exit 1
fi
if [[ "$DATABASE_URL" == "$STAGING_DATABASE_URL" ]]; then
  echo "❌ STAGING_DATABASE_URL equals DATABASE_URL — aborting. Never restore onto production."; exit 1
fi

echo "  Production:  $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
echo "  Staging:     $(echo $STAGING_DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
echo ""

echo "▶ Step 1: Dumping production database..."
pg_dump "$DATABASE_URL" --no-owner --no-acl --format=custom --file="$DUMP_FILE"
echo "  ✅ Dump: $DUMP_FILE ($(du -sh $DUMP_FILE | cut -f1))"

echo ""
echo "▶ Step 2: Restoring into staging..."
pg_restore --no-owner --no-acl --format=custom --dbname="$STAGING_DATABASE_URL" "$DUMP_FILE"
echo "  ✅ Restore complete"

echo ""
echo "▶ Step 3: Verifying row counts..."
PROD_USERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
STAGING_USERS=$(psql "$STAGING_DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
STAGING_QUESTIONS=$(psql "$STAGING_DATABASE_URL" -t -c "SELECT COUNT(*) FROM questions;" | tr -d ' ')

echo "  Production users:  $PROD_USERS"
echo "  Staging users:     $STAGING_USERS"
echo "  Staging questions: $STAGING_QUESTIONS"

if [[ "$PROD_USERS" -gt 0 && "$STAGING_USERS" -eq 0 ]]; then
  echo "❌ Users table empty in staging — restore failed"; exit 1
fi
if [[ "$STAGING_QUESTIONS" -lt 100 ]]; then
  echo "❌ Only $STAGING_QUESTIONS questions in staging — restore incomplete"; exit 1
fi

echo "  ✅ Row counts verified"

echo ""
echo "=========================================="
echo "  ✅ RESTORE DRILL COMPLETE — Drill ID: $DRILL_ID"
echo ""
echo "  Add to .env.local:"
echo "  BACKUP_RESTORE_DRILL_ID=$DRILL_ID"
echo ""
echo "  Then run: node scripts/verify-backup-restore.js"
echo "=========================================="

read -p "Delete dump file $DUMP_FILE? [y/N] " confirm
if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then rm "$DUMP_FILE"; echo "  🗑  Dump deleted"; fi
