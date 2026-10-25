#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

OUTPUT_DIR="out/make/dmg"
mkdir -p "$OUTPUT_DIR"

build_dmg_for_arch() {
  local ARCH="$1"
  local APP_PATH="out/ClassFlow-darwin-${ARCH}/ClassFlow.app"
  local STAGING_DIR="out/dmg-staging-${ARCH}"
  local DMG_NAME="ClassFlow-1.0.0-${ARCH}.dmg"
  local DMG_PATH="$OUTPUT_DIR/$DMG_NAME"
  local ROOT_DMG="out/$DMG_NAME"

  echo ""
  echo "=== Building DMG for ${ARCH} ==="

  # 1. Package fresh bundle for architecture
  echo "[+] Packaging fresh bundle for ${ARCH}..."
  rm -rf "$APP_PATH"
  npx electron-forge package --arch="$ARCH"

  # 2. Prepare staging directory
  echo "[+] Setting up staging directory for ${ARCH}..."
  rm -rf "$STAGING_DIR"
  mkdir -p "$STAGING_DIR"

  # 3. Copy ClassFlow.app
  echo "[+] Copying ${APP_PATH}..."
  cp -R "$APP_PATH" "$STAGING_DIR/ClassFlow.app"

  # 4. Fix permissions and ad-hoc sign inside staging
  echo "[+] Ensuring permissions and ad-hoc signing..."
  chmod -R u+w "$STAGING_DIR/ClassFlow.app"
  chmod -R a+rX "$STAGING_DIR/ClassFlow.app"
  xattr -cr "$STAGING_DIR/ClassFlow.app" 2>/dev/null || true
  codesign --force --deep --sign - "$STAGING_DIR/ClassFlow.app" 2>/dev/null || true

  # 5. Create Applications symlink for drag-and-drop install
  echo "[+] Creating /Applications drag-and-drop link..."
  ln -s /Applications "$STAGING_DIR/Applications"

  # 6. Build compressed UDZO DMG image using macOS native hdiutil
  echo "[+] Generating ${DMG_NAME} via hdiutil..."
  rm -f "$DMG_PATH" "$ROOT_DMG"
  hdiutil create \
    -volname "ClassFlow" \
    -srcfolder "$STAGING_DIR" \
    -ov \
    -format UDZO \
    -fs HFS+ \
    "$DMG_PATH"

  # 7. Strip quarantine from generated DMG
  xattr -cr "$DMG_PATH" 2>/dev/null || true

  # 8. Copy to root out/ directory
  cp "$DMG_PATH" "$ROOT_DMG"

  # 9. Clean up staging directory
  rm -rf "$STAGING_DIR"

  echo "[✔] Completed ${DMG_NAME}:"
  ls -lh "$DMG_PATH"
}

# Build for both Apple Silicon (arm64) and Intel (x64)
build_dmg_for_arch "arm64"
build_dmg_for_arch "x64"

# Default shortcut
cp "out/ClassFlow-1.0.0-arm64.dmg" "out/ClassFlow-1.0.0.dmg"

echo ""
echo "=== All DMGs Built Successfully ==="
echo "Apple Silicon (M1/M2/M3/M4): out/ClassFlow-1.0.0-arm64.dmg"
echo "Intel Macs (Core i5/i7/i9):  out/ClassFlow-1.0.0-x64.dmg"
echo "Default:                     out/ClassFlow-1.0.0.dmg"
