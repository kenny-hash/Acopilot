#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm 未安装"; exit 1; }

choose_python() {
  local candidates=(python3.12 python3.11 python3.10 python3)
  local py
  for py in "${candidates[@]}"; do
    if command -v "$py" >/dev/null 2>&1; then
      local ver
      ver=$("$py" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
      if [[ "$ver" =~ ^3\.(10|11|12)$ ]]; then
        echo "$py"
        return 0
      fi
    fi
  done
  return 1
}

PYTHON_BIN="$(choose_python || true)"
if [ -z "$PYTHON_BIN" ]; then
  echo "[ERROR] 未找到受支持的 Python 版本（需要 3.10/3.11/3.12）。"
  echo "[ERROR] 当前依赖（pydantic-core==2.20.1）在 Python 3.14 上会触发源码编译并要求 Rust。"
  exit 1
fi

PYTHON_VER="$($PYTHON_BIN -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
echo "[INFO] 使用 Python: $PYTHON_BIN ($PYTHON_VER)"

if [ -x "$BACKEND_DIR/.venv/bin/python" ]; then
  VENV_VER="$($BACKEND_DIR/.venv/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || echo unknown)"
  if [[ ! "$VENV_VER" =~ ^3\.(10|11|12)$ ]]; then
    echo "[WARN] 检测到已有虚拟环境版本为 $VENV_VER，删除后按 $PYTHON_VER 重建。"
    rm -rf "$BACKEND_DIR/.venv"
  fi
fi

if [ ! -d "$BACKEND_DIR/.venv" ]; then
  "$PYTHON_BIN" -m venv "$BACKEND_DIR/.venv"
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
