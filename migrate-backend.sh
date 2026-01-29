#!/bin/bash

# Backend Migration Script
# This script archives old files and ensures only the new src/ structure is used

echo "🔄 Starting backend migration..."

# Create backup directory
mkdir -p .old_backend_backup

# Move old directories to backup
echo "📦 Backing up old files..."
mv controller .old_backend_backup/ 2>/dev/null && echo "  ✓ Moved controller/"
mv routes .old_backend_backup/ 2>/dev/null && echo "  ✓ Moved routes/"
mv models .old_backend_backup/ 2>/dev/null && echo "  ✓ Moved models/"
mv config .old_backend_backup/ 2>/dev/null && echo "  ✓ Moved config/"
mv database .old_backend_backup/ 2>/dev/null && echo "  ✓ Moved database/"

echo ""
echo "✅ Migration complete!"
echo ""
echo "📁 New structure is now active in src/"
echo "📁 Old files backed up in .old_backend_backup/"
echo ""
echo "Next steps:"
echo "1. Make sure you have a .env file with required variables"
echo "2. Run: node server.js"
echo "3. Test your endpoints"
echo ""
echo "If everything works, you can delete .old_backend_backup/"
