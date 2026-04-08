#!/bin/bash

# SafeSpace AI – Start Development Environment
# This script sets up and runs the development server

echo "🚀 SafeSpace AI – Starting Development Environment"
echo "=================================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "  Node version: $(node --version)"
echo "  npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Check .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local from template..."
    cp .env.example .env.local
    echo "✓ .env.local created (customize as needed)"
else
    echo "✓ .env.local exists"
fi
echo ""

# Start development server
echo "🔥 Starting development server..."
echo "=================================="
echo ""
echo "📍 Open your browser: http://localhost:3000"
echo ""
echo "Available pages:"
echo "  • http://localhost:3000          – Dashboard"
echo "  • http://localhost:3000/routes   – Safe Routes"
echo "  • http://localhost:3000/contacts – Emergency Contacts"
echo "  • http://localhost:3000/settings – Settings"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
