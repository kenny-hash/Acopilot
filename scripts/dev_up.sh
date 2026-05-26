#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

command -v python3 >/dev/null 2>&1 || { echo "[ERROR] python3 未安装"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm 未安装"; exit 1; }

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  python3 -m venv "$BACKEND_DIR/.venv"
fi

# shellcheck disable=SC1091
source "$BACKEND_DIR/.venv/bin/activate"
pip install --upgrade pip >/dev/null
pip install -r "$BACKEND_DIR/requirements.txt"

npm --prefix "$FRONTEND_DIR" install

cleanup() {
  echo "\n[INFO] 正在停止前后端服务..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(
  cd "$BACKEND_DIR"
  uvicorn app.main:app --host 0.0.0.0 --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

echo "[INFO] 后端运行中: http://127.0.0.1:${BACKEND_PORT}"
echo "[INFO] 前端运行中: http://127.0.0.1:${FRONTEND_PORT}"
echo "[INFO] 按 Ctrl+C 一键停止"

wait -n "$BACKEND_PID" "$FRONTEND_PID"
