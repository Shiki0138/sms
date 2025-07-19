#!/bin/bash

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Run TypeScript compiler
echo "Building TypeScript..."
npx tsc

# Exit with the tsc exit code
exit $?