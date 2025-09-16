#!/bin/bash

# AI Code Generator v13 - Setup Script
# This script automates the installation and setup process

set -e

echo "🚀 AI Code Generator v13 - Setup Script"
echo "========================================"

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm version
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file
echo ""
echo "🔧 Setting up environment configuration..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  Please edit .env.local and add your API keys"
else
    echo "⚠️  .env.local already exists, skipping creation"
fi

# Check TypeScript
echo ""
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them before continuing."
    exit 1
fi

echo "✅ TypeScript check passed"

# Build the project
echo ""
echo "🏗️  Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Setup complete
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and add your API keys:"
echo "   - OPENAI_API_KEY (optional, for AI features)"
echo "   - Configure EmailJS in app/page.tsx"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "4. Allow microphone access when prompted"
echo ""
echo "📚 Documentation:"
echo "- Installation: INSTALLATION.md"
echo "- EmailJS Setup: emailjs-setup.md"
echo "- Voice Setup: VOICE_SETUP_GUIDE.md"
echo "- Deployment: DEPLOYMENT.md"
echo ""
echo "🎤 Ready to generate code with voice commands!"
