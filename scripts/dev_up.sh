#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
PYTHON_BIN="${PYTHON_BIN:-}"

command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm 未安装"; exit 1; }

pick_python() {
  if [ -n "$PYTHON_BIN" ]; then
    command -v "$PYTHON_BIN" >/dev/null 2>&1 || { echo "[ERROR] PYTHON_BIN=$PYTHON_BIN 不可用"; exit 1; }
    echo "$PYTHON_BIN"
    return
  fi

  for candidate in python3.12 python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return
    fi
  done

  echo "[ERROR] 未找到可用的 Python 可执行文件" >&2
  exit 1
}

PYTHON_BIN="$(pick_python)"
PY_VER="$($PYTHON_BIN -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
echo "[INFO] 使用 Python: $PYTHON_BIN ($PY_VER)"

if [ "$PY_VER" = "3.14" ]; then
  echo "[WARN] 检测到 Python 3.14，部分依赖可能无预编译 wheel。建议设置 PYTHON_BIN=python3.11 重试。"
fi

if [ -x "$VENV_DIR/bin/python" ]; then
  VENV_VER="$($VENV_DIR/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
  if [ "$VENV_VER" != "$PY_VER" ]; then
    echo "[INFO] 现有虚拟环境 Python 版本($VENV_VER)与当前($PY_VER)不一致，重建 .venv"
    rm -rf "$VENV_DIR"
  fi
fi

if [ ! -d "$VENV_DIR" ]; then
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip >/dev/null
python -m pip install -r "$BACKEND_DIR/requirements.txt"

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
