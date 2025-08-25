#!/usr/bin/env bash
set -euo pipefail

# === 基本路径 ===
SRC="/home/admin/projects/znav"      # 现在：源码/静态文件所在
# 如果以后有打包产物（如 dist），把上面换成：SRC="/home/admin/projects/znav/dist"
DEST="/home/admin/sites/znav"        # 部署目录（Nginx root 指向这里）

# === 首次或缺目录时自动创建 ===
mkdir -p "$DEST"

# === 同步（排除无关文件），本机到本机很快 ===
rsync -av --delete \
  --exclude ".git" --exclude "node_modules" --exclude ".DS_Store" \
  --exclude ".idea" --exclude ".vscode" \
  "$SRC"/ "$DEST"/

# === 统一权限（Nginx 可读）===
# 用 rsync 的 --chmod 也行，这里用 find 直观
find "$DEST" -type d -exec chmod 755 {} \;
find "$DEST" -type f -exec chmod 644 {} \;

echo "✅ Deploy finished: $SRC  ->  $DEST"
