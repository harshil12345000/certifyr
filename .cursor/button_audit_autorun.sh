#!/bin/bash
# Auto-regenerate button audit CSV for Certifyr
npx --yes tsx scripts/generate_button_audit.ts > button_audit.csv 