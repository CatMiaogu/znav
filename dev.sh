#!/bin/bash
# 启动 live-server，只监听服务器本地，避免暴露公网
pnpm dlx live-server --host=127.0.0.1 --port=5173 --no-browser

