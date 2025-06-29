#!/bin/bash
echo "=== Searching for refund creation code ==="
echo "1. Finding files with refunds.create:"
find src -name "*.ts" -exec grep -l "refunds\.create" {} \;
echo ""

echo "2. Finding lines with payment_intent in refund context:"
find src -name "*.ts" -exec grep -n -B5 -A5 "payment_intent.*refund\|refund.*payment_intent" {} \;
echo ""

echo "3. All refunds.create calls:"
find src -name "*.ts" -exec grep -n -B10 -A10 "refunds\.create" {} \;
echo ""

echo "4. Line 485 context in stripeProvider.ts:"
sed -n '480,490p' src/services/payments/stripeProvider.ts