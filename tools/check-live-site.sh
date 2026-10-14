#!/bin/sh
# Is the published site the one in this checkout?
#
# "The live site is current" is a claim about the deployment, and the only way to know it is to ask
# the deployment. tools/stage-site.sh defines what gets published, but nothing checked that Pages
# actually served it - that was done by hand, by fetching a couple of files and comparing digests.
# This does the same check on every file the page loads, so a stale or half-published site fails
# loudly instead of being noticed later.
#
#   sh tools/check-live-site.sh [base-url]
#
# The checkout has CRLF line endings and the Linux runner that stages the site checks out LF, so text
# is compared with the line endings removed; an image has no line endings and is compared by digest.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
BASE=${1:-https://kevinelong.github.io/textcrush}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# published path:file in this checkout:how to compare. The service worker is served from the site
# root, not from web/ - see the header of source/web/sw.js.
FILES="
web/index.html:source/web/index.html:text
web/manifest.webmanifest:source/web/manifest.webmanifest:text
sw.js:source/web/sw.js:text
game/classes/model/Game.js:source/game/classes/model/Game.js:text
game/classes/view/Display.js:source/game/classes/view/Display.js:text
web/icons/icon-192.png:source/web/icons/icon-192.png:bytes
"

echo "published: $BASE"
echo "checkout:  $ROOT"

compared=0
failed=0

for entry in $FILES; do

    live=${entry%%:*}
    rest=${entry#*:}
    src=${rest%%:*}
    how=${rest##*:}

    if ! curl -fsS "$BASE/$live" -o "$TMP/live"; then
        echo "  FAIL  $live is not served by $BASE"
        failed=$((failed + 1))
        continue
    fi

    if [ "$how" = "bytes" ]; then
        # read through stdin: given a path, sha256sum escapes it with a leading backslash on Windows,
        # which would end up compared against the published file's digest
        live_sum=$(sha256sum < "$TMP/live" | cut -d' ' -f1)
        local_sum=$(sha256sum < "$ROOT/$src" | cut -d' ' -f1)
    else
        tr -d '\r' < "$TMP/live" > "$TMP/live.normalised"
        tr -d '\r' < "$ROOT/$src" > "$TMP/src.normalised"
        live_sum=$(sha256sum < "$TMP/live.normalised" | cut -d' ' -f1)
        local_sum=$(sha256sum < "$TMP/src.normalised" | cut -d' ' -f1)
    fi

    compared=$((compared + 1))

    if [ "$live_sum" = "$local_sum" ]; then
        echo "  same  $live"
    else
        echo "  DIFF  $live"
        echo "        published $live_sum"
        echo "        checkout  $local_sum"
        failed=$((failed + 1))
    fi
done

# The site root is the one file that is generated rather than copied: stage-site.sh writes a
# redirect to ./web/index.html, so it is checked for what it does rather than for its bytes.
if curl -fsS "$BASE/" | grep -q "./web/index.html"; then
    echo "  same  / (redirects to ./web/index.html)"
    compared=$((compared + 1))
else
    echo "  DIFF  / does not point at ./web/index.html"
    failed=$((failed + 1))
fi

echo "$compared compared, $failed different"

if [ "$failed" -ne 0 ]; then
    echo "the published site is NOT this checkout"
    exit 1
fi

echo "the published site is this checkout"
