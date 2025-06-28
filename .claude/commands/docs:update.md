# Update Project Documentation

Maintain and update Fill The Field project documentation.

```bash
echo "📚 Fill The Field - Documentation Update Workflow"
echo "================================================="
echo ""

# Check if bugs.md needs updates
if [ -f "docs/bugs.md" ]; then
    echo "🐛 Bug Documentation Status:"
    
    # Count open vs resolved bugs
    OPEN_COUNT=$(grep -c "🔴\|OPEN" docs/bugs.md 2>/dev/null || echo "0")
    RESOLVED_COUNT=$(grep -c "✅\|RESOLVED" docs/bugs.md 2>/dev/null || echo "0")
    
    echo "  • Open bugs: $OPEN_COUNT"
    echo "  • Resolved bugs: $RESOLVED_COUNT"
    
    # Check for bugs marked ready for test
    READY_FOR_TEST=$(grep -c "🟡.*Ready for Test\|READY FOR TEST" docs/bugs.md 2>/dev/null || echo "0")
    if [ "$READY_FOR_TEST" -gt 0 ]; then
        echo "  ⚠️  $READY_FOR_TEST bugs ready for testing"
    fi
    
    echo ""
fi

# Check CLAUDE.md for updates
if [ -f "CLAUDE.md" ]; then
    echo "🤖 CLAUDE.md Status:"
    LAST_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%d" CLAUDE.md 2>/dev/null || date "+%Y-%m-%d")
    echo "  • Last updated: $LAST_MODIFIED"
    echo "  ✅ AI development guidelines are documented"
    echo ""
fi

# Check for TODO comments in code
echo "📝 Code Documentation Check:"
TODO_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -c "TODO\|FIXME\|XXX" 2>/dev/null | awk -F: '{sum += $2} END {print sum+0}')
echo "  • TODO/FIXME comments: $TODO_COUNT"

if [ "$TODO_COUNT" -gt 0 ]; then
    echo "  📋 Recent TODOs found:"
    find src -name "*.tsx" -o -name "*.ts" | xargs grep -n "TODO\|FIXME\|XXX" 2>/dev/null | head -5
fi

echo ""
echo "🎯 Documentation Update Recommendations:"

# Suggest README updates if needed
if [ ! -f "README.md" ] || [ $(stat -f "%m" README.md) -lt $(stat -f "%m" package.json) ]; then
    echo "  📄 Consider updating README.md with recent changes"
fi

# Check for new features that need documentation
RECENT_FEATURES=$(git log --since="1 week ago" --oneline | grep -i "feat\|feature" | wc -l)
if [ "$RECENT_FEATURES" -gt 0 ]; then
    echo "  🆕 $RECENT_FEATURES new features may need documentation"
fi

echo "  💡 Use /bug or /feature commands to maintain consistent documentation"
echo "  📚 Keep CLAUDE.md updated with new development patterns"

echo ""
echo "✅ Documentation review complete!"
```

This command helps maintain project documentation by checking bug status, TODO comments, and suggesting updates.