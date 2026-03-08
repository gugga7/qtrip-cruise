#!/bin/bash

echo "Checking for Strapi references..."

# Check for Strapi in source files
find src -type f -exec grep -l "strapi\|STRAPI" {} \;

# Check for api.ts references
find src -type f -exec grep -l "api.ts" {} \;

# Check for environment variables
grep -r "VITE_STRAPI" .env* 