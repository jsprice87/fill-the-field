# Project Status Overview

Get a comprehensive overview of the Fill The Field project status.

```bash
echo "📊 Fill The Field - Project Status Overview"
echo "==========================================="
echo ""

# Git information
echo "🔗 Git Information:"
echo "  📍 Current branch: $(git branch --show-current)"
echo "  📝 Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
echo "  📈 Commits ahead of origin: $(git rev-list --count HEAD ^origin/$(git branch --show-current) 2>/dev/null || echo '0')"
echo ""

# Package information
echo "📦 Project Information:"
echo "  📋 Version: $(node -p "require('./package.json').version")"
echo "  🏷️  Name: $(node -p "require('./package.json').name")"
echo "  🔧 Node.js: $(node --version)"
echo "  📁 npm: $(npm --version)"
echo ""

# Development status
echo "🔧 Development Status:"
if [ -f "docs/bugs.md" ]; then
    OPEN_BUGS=$(grep -c "🔴\|OPEN" docs/bugs.md 2>/dev/null || echo "0")
    RESOLVED_BUGS=$(grep -c "✅\|RESOLVED" docs/bugs.md 2>/dev/null || echo "0")
    echo "  🐛 Open bugs: $OPEN_BUGS"
    echo "  ✅ Resolved bugs: $RESOLVED_BUGS"
fi

# Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ $UNCOMMITTED -gt 0 ]; then
    echo "  ⚠️  Uncommitted changes: $UNCOMMITTED files"
else
    echo "  ✅ Working directory clean"
fi

# Recent activity
echo ""
echo "📈 Recent Activity (last 5 commits):"
git log --oneline -5 --pretty=format:"  %C(yellow)%h%C(reset) %s %C(dim)(%cr)%C(reset)"

echo ""
echo ""
echo "💡 Quick Actions:"
echo "  • /build-test - Run full build and test pipeline"
echo "  • /deploy - Check deployment readiness"
echo "  • /bug - Create new bug report"
echo "  • /feature - Create new feature request"
```

This provides a comprehensive project overview including git status, package info, bug tracking, and recent commits.