# Development Environment Setup

Quick setup guide for new developers on the Fill The Field project.

## Prerequisites Check

```bash
echo "🔧 Fill The Field - Development Environment Setup"
echo "================================================"
echo ""

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check git
if command -v git >/dev/null 2>&1; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git not found. Please install Git"
    exit 1
fi

echo ""
echo "📋 Project Setup Steps:"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "📄 Created .env.local from .env.example"
        echo "⚠️  Please update .env.local with your Supabase credentials"
    else
        echo "⚠️  No .env.example found. You may need to create .env.local manually"
    fi
fi

# Run type check
echo "🔤 Running TypeScript check..."
npm run typecheck

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  • npm run dev - Start development server"
echo "  • /status - Check project status"
echo "  • /build-test - Run full test pipeline"
```

This command helps new developers get started quickly with proper environment setup and validation.