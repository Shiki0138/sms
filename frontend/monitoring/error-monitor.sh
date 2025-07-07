#!/bin/bash

# エラーログ監視
ERROR_COUNT=0
THRESHOLD=10

tail -f logs/error/*.log | while read line; do
  if [[ $line == *"ERROR"* ]]; then
    ERROR_COUNT=$((ERROR_COUNT + 1))
    echo "⚠️  Error detected: $line"
    
    if [ $ERROR_COUNT -ge $THRESHOLD ]; then
      echo "🚨 Error threshold reached! Sending alert..."
      # アラート送信処理
      ERROR_COUNT=0
    fi
  fi
done
