#!/bin/bash

set -e

echo "🚀 Starting Shaadi Biodata App Setup & Launch..."

PROJECT_ROOT="$(pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Step 1: Build frontend
echo "📦 Building frontend..."
cd "$FRONTEND_DIR"
npm run build

# Step 2: Move build to backend
echo "📂 Moving build to backend..."
rm -rf "$BACKEND_DIR/frontend"
mv "$FRONTEND_DIR/build" "$BACKEND_DIR/frontend"

# Step 3: Start backend server in production mode
echo "🟢 Launching server..."
cd "$BACKEND_DIR"
NODE_ENV=production node server.js
