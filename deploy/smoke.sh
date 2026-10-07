#!/usr/bin/env sh
# Smoke checks of the shell image (Annex H "Cómo se verifica", norm 5.1). Usage:
#   deploy/smoke.sh http://localhost:5173
# Exit code 0 when every check passes. Needs curl.
set -eu
BASE="${1:-http://localhost:5173}"
fail() { echo "FAIL: $1" >&2; exit 1; }
status() { curl -s -o /dev/null -w '%{http_code}' "$1"; }
header() { curl -s -D - -o /dev/null "$1" | tr -d '\r' | grep -i "^$2:" | head -n1 | cut -d' ' -f2- ; }

[ "$(status "$BASE/health")" = "200" ] || fail "/health is not 200"
[ "$(status "$BASE/")" = "200" ] || fail "/ is not 200"
# Every router route must serve the document (SPA fallback), never a 404 from NGINX.
[ "$(status "$BASE/enrollment/schedule")" = "200" ] || fail "router route did not fall back to index.html"
# The federation entry and the document are never cached (Annex H rule 4).
case "$(header "$BASE/remoteEntry.js" Cache-Control)" in *no-store*) ;; *) fail "remoteEntry.js is cacheable";; esac
case "$(header "$BASE/" Cache-Control)" in *no-store*) ;; *) fail "index.html is cacheable";; esac
# Hashed assets are immutable.
ASSET=$(curl -s "$BASE/" | grep -o '/assets/[^"]*\.js' | head -n1)
[ -n "$ASSET" ] || fail "no asset referenced by index.html"
case "$(header "$BASE$ASSET" Cache-Control)" in *immutable*) ;; *) fail "asset $ASSET is not immutable";; esac
# The built bundle never carries the development sign-in unless the build asked for it.
if [ "${EXPECT_DEV_LOGIN:-false}" != "true" ]; then
  curl -s "$BASE$ASSET" | grep -q "dev-sign-in" && fail "development sign-in found in the bundle" || true
fi
echo "OK: shell smoke checks passed against $BASE"
