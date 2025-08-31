#!/usr/bin/env bash
set -e
# 触れてはいけないパス（既存UI/API）
PROTECT=( "src/components" "src/app/(public)" "src/app/(app)" "src/app/needs" "src/app/api" )
if git diff --cached --name-status | grep -E '^(D|R)' >/dev/null; then
  while read -r status file; do
    for p in "${PROTECT[@]}"; do
      if [[ "$file" == $p* ]]; then
        echo "❌ Protected path deletion/rename detected: $file"
        echo "   現行UI/APIは凍結中です。/src/app/(ui2) で作業してください。"
        exit 1
      fi
    done
  done < <(git diff --cached --name-status)
fi
exit 0
