#!/bin/sh
# Assemble the publishable site: web/ and game/ side by side, the service worker at the root (so its
# scope covers both), and a redirect at /.
#
# This is the single definition of the published layout: GitHub Pages runs it, and a local check does
#     sh tools/stage-site.sh
#     python -m http.server 8020 --directory build/site
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
SITE="$ROOT/build/site"

rm -rf "$SITE"
mkdir -p "$SITE"

cp -r "$ROOT/source/web" "$SITE/web"
cp -r "$ROOT/source/game" "$SITE/game"

# The page loads the compiled JavaScript; the TypeScript is the source it was built from.
find "$SITE" -name '*.ts' -delete

# The worker is served from the root and not from web/ - see the header of sw.js.
cp "$ROOT/source/web/sw.js" "$SITE/sw.js"
rm "$SITE/web/sw.js"

cat > "$SITE/index.html" <<'HTML'
<!doctype html>
<meta charset="utf-8">
<title>Text Crush</title>
<link rel="canonical" href="./web/index.html">
<meta http-equiv="refresh" content="0; url=./web/index.html">
<p><a href="./web/index.html">Play Text Crush</a></p>
HTML

find "$SITE" -type f | wc -l | tr -d ' ' | sed 's/^/site files: /'
echo "staged: $SITE"
