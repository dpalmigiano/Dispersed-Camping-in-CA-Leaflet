#!/data/data/com.termux/files/usr/bin/sh
# Simple Termux Widget script to check camping legality
DIR="$(dirname "$0")"
LOC=$(termux-location --provider gps --request once)
LAT=$(echo "$LOC" | jq -r '.latitude')
LON=$(echo "$LOC" | jq -r '.longitude')
RESULT=$(node "$DIR/checkCamping.js" "$LAT" "$LON")
if echo "$RESULT" | grep -q '^https'; then
  termux-open-url "$RESULT"
else
  termux-toast "$RESULT"
fi
