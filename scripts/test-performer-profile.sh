#!/bin/bash
# Script para ejecutar tests del Performer Profile refactorizado

echo "🧪 Ejecutando tests del Performer Profile..."
echo ""

echo "📋 Tests Unitarios"
echo "===================="
npm run test -- src/tests/unit/performerProfile/

echo ""
echo "🎭 Tests E2E (Playwright)"
echo "=========================="
echo "Para ejecutar tests e2e:"
echo "  npm run test:e2e -- tests/e2e/performer-profile.spec.ts"
echo ""
echo "O para ejecutar en modo UI:"
echo "  npm run test:e2e:ui -- tests/e2e/performer-profile.spec.ts"
