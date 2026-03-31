#!/usr/bin/env bash
set -e

echo "=== EverMemOS-Pretext Setup ==="

echo "[1/3] Initializing submodules..."
git submodule update --init --recursive

echo "[2/3] Building Pretext package (bun)..."
cd pretext
bun install
bun run build:package
cd ..

echo "[3/3] Installing Hub dependencies (npm)..."
cd hub
npm install
cd ..

echo "=== Setup complete. ==="
echo "  Pretext dist: pretext/dist/layout.js"
echo "  Hub dev:      cd hub && npm run dev  (port 3001)"
