#!/bin/bash

set -e  # Exit if any command fails

echo "🔧 Starting full project setup..."

# Step 1: Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Step 2: Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  backend/.env file missing. Creating a sample one..."
    cat <<EOF > .env
PORT=5000
JWT_SECRET=replace_this_with_secure_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

OPENAI_API_KEY=your_openai_api_key
EOF
    echo "✅ Sample .env created at backend/.env – edit it with real values!"
else
    echo "✅ backend/.env already exists."
fi

# Step 3: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Step 4: Build frontend
echo "🏗️ Building frontend (React)..."
npm run build

# Step 5: Move build to backend for production serving
echo "🚚 Moving build to backend folder..."
rm -rf ../backend/frontend
mv build ../backend/frontend

# Step 6: Return to project root
cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "👉 To start the production server, run:"
echo "   cd backend && NODE_ENV=production node server.js"
