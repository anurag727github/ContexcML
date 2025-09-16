#!/bin/bash

# AI Code Generator v13 - Deployment Script
# Automates the deployment process to various platforms

set -e

echo "🚀 AI Code Generator v13 - Deployment Script"
echo "============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to deploy to Vercel
deploy_vercel() {
    echo "🔥 Deploying to Vercel..."
    
    if ! command_exists vercel; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    echo "🏗️  Building and deploying..."
    vercel --prod
    
    echo "✅ Deployed to Vercel successfully!"
    echo "🌐 Your app is now live with automatic HTTPS"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo "🌊 Deploying to Netlify..."
    
    if ! command_exists netlify; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    echo "🏗️  Building project..."
    npm run build
    
    echo "🚀 Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    echo "✅ Deployed to Netlify successfully!"
}

# Function to build Docker image
build_docker() {
    echo "🐳 Building Docker image..."
    
    if ! command_exists docker; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    echo "🏗️  Building Docker image..."
    docker build -t ai-code-generator-v13 .
    
    echo "✅ Docker image built successfully!"
    echo "🚀 Run with: docker run -p 3000:3000 ai-code-generator-v13"
}

# Function to run pre-deployment checks
pre_deployment_checks() {
    echo "🔍 Running pre-deployment checks..."
    
    # Check if build works
    echo "📋 Testing build..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix errors before deploying."
        exit 1
    fi
    
    # Check TypeScript
    echo "📋 Checking TypeScript..."
    npm run type-check
    
    if [ $? -ne 0 ]; then
        echo "❌ TypeScript errors found. Please fix them before deploying."
        exit 1
    fi
    
    # Check for environment variables
    if [ ! -f .env.local ] && [ ! -f .env ]; then
        echo "⚠️  No environment file found. Make sure to configure environment variables in your deployment platform."
    fi
    
    echo "✅ Pre-deployment checks passed"
}

# Main menu
echo ""
echo "Please choose a deployment option:"
echo "1) Vercel (Recommended - Automatic HTTPS)"
echo "2) Netlify (Static hosting with serverless functions)"
echo "3) Docker (Self-hosted containerized deployment)"
echo "4) Run pre-deployment checks only"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        pre_deployment_checks
        deploy_vercel
        ;;
    2)
        pre_deployment_checks
        deploy_netlify
        ;;
    3)
        pre_deployment_checks
        build_docker
        ;;
    4)
        pre_deployment_checks
        echo "✅ All checks passed. Ready for deployment!"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "- [ ] Test voice recognition functionality"
echo "- [ ] Verify microphone permissions work"
echo "- [ ] Test email delivery"
echo "- [ ] Check mobile compatibility"
echo "- [ ] Monitor for any errors"
echo ""
echo "📚 Need help? Check DEPLOYMENT.md for detailed instructions."
