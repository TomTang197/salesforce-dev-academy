#!/bin/zsh
set -e

APP_NAME="ForceCraft Studio"
PROJECT_DIR="/Users/tom/Tom-CV/salesforce-dev-academy"
APP_BUNDLE="${PROJECT_DIR}/${APP_NAME}.app"

rm -rf "${APP_BUNDLE}"
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"

# 1. Create Info.plist
cat << 'PLIST' > "${APP_BUNDLE}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>launcher</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleIdentifier</key>
  <string>com.tom.forcecraft-studio</string>
  <key>CFBundleName</key>
  <string>ForceCraft Studio</string>
  <key>CFBundleDisplayName</key>
  <string>ForceCraft Studio (SF Dev)</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>2.0.0</string>
  <key>CFBundleVersion</key>
  <string>2.0.0</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
PLIST

# 2. Create the MacOS executable launcher
cat << 'LAUNCHER' > "${APP_BUNDLE}/Contents/MacOS/launcher"
#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:$PATH"

PROJECT_DIR="/Users/tom/Tom-CV/salesforce-dev-academy"
PORT=5188
URL="http://localhost:${PORT}"
LOG_FILE="/tmp/forcecraft-studio-server.log"

# Check if port 5188 is already listening
if ! lsof -iTCP:${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
  cd "${PROJECT_DIR}"
  nohup npm run dev -- --port ${PORT} > "${LOG_FILE}" 2>&1 &
  # Wait up to 8 seconds for server to listen
  for i in {1..32}; do
    if lsof -iTCP:${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
  done
fi

# Open in Chrome App Mode (standalone window) if Chrome exists, otherwise default browser
if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="${URL}"
else
  open "${URL}"
fi
LAUNCHER

chmod +x "${APP_BUNDLE}/Contents/MacOS/launcher"

# 3. Generate a sleek Linear-style dark/indigo AppIcon.icns using Swift + AppKit
cat << 'SWIFT' > /tmp/make_icon.swift
import AppKit

let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)
image.lockFocus()

let rect = NSRect(origin: .zero, size: size)
let path = NSBezierPath(roundedRect: rect.insetBy(dx: 40, dy: 40), xRadius: 210, yRadius: 210)

// Deep Linear obsidian gradient background
let bgGradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.06, green: 0.07, blue: 0.11, alpha: 1.0),
    NSColor(calibratedRed: 0.02, green: 0.02, blue: 0.04, alpha: 1.0)
])!
bgGradient.draw(in: path, angle: -45)

// Indigo/Lavender accent border
NSColor(calibratedRed: 0.37, green: 0.42, blue: 0.82, alpha: 0.85).setStroke()
path.lineWidth = 18
path.stroke()

// Draw "SF" emblem
let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center

let titleAttrs: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 410, weight: .bold),
    .foregroundColor: NSColor(calibratedRed: 0.65, green: 0.71, blue: 0.99, alpha: 1.0),
    .paragraphStyle: paragraph
]
let subtitleAttrs: [NSAttributedString.Key: Any] = [
    .font: NSFont.monospacedSystemFont(ofSize: 96, weight: .semibold),
    .foregroundColor: NSColor(calibratedRed: 0.94, green: 0.95, blue: 0.98, alpha: 0.9),
    .paragraphStyle: paragraph
]

NSString(string: "SF").draw(in: NSRect(x: 0, y: 310, width: 1024, height: 500), withAttributes: titleAttrs)
NSString(string: "DEV LAB").draw(in: NSRect(x: 0, y: 170, width: 1024, height: 160), withAttributes: subtitleAttrs)

image.unlockFocus()

if let tiffData = image.tiffRepresentation,
   let bitmap = NSBitmapImageRep(data: tiffData),
   let pngData = bitmap.representation(using: .png, properties: [:]) {
    try? pngData.write(to: URL(fileURLWithPath: "/tmp/forcecraft_icon_1024.png"))
}
SWIFT

swift /tmp/make_icon.swift
ICONSET="/tmp/AppIcon.iconset"
rm -rf "${ICONSET}"
mkdir -p "${ICONSET}"

for sz in 16 32 128 256 512; do
  sips -z $sz $sz /tmp/forcecraft_icon_1024.png --out "${ICONSET}/icon_${sz}x${sz}.png" >/dev/null
  dbl=$((sz * 2))
  sips -z $dbl $dbl /tmp/forcecraft_icon_1024.png --out "${ICONSET}/icon_${sz}x${sz}@2x.png" >/dev/null
done

iconutil -c icns "${ICONSET}" -o "${APP_BUNDLE}/Contents/Resources/AppIcon.icns"
rm -rf "${ICONSET}" /tmp/forcecraft_icon_1024.png /tmp/make_icon.swift

# 4. Also create a double-clickable .command script in the project root
cat << 'CMD' > "${PROJECT_DIR}/启动 ForceCraft 学习平台.command"
#!/bin/zsh
open "/Users/tom/Tom-CV/salesforce-dev-academy/ForceCraft Studio.app"
CMD
chmod +x "${PROJECT_DIR}/启动 ForceCraft 学习平台.command"

# 5. Copy to /Applications and ~/Desktop for instant access
cp -R "${APP_BUNDLE}" "/Applications/${APP_NAME}.app" 2>/dev/null || true
cp -R "${APP_BUNDLE}" "$HOME/Desktop/${APP_NAME}.app" 2>/dev/null || true

echo "Successfully built and installed ForceCraft Studio.app!"
