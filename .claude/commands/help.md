# Custom Commands Help

Complete reference for Fill The Field custom Claude commands.

## 📋 Available Commands

### 🔧 Development Workflow
- `/build-test` - Run complete build and test pipeline
- `/deploy` - Check deployment readiness with comprehensive validation
- `/status` - Get project overview (git, bugs, recent activity)
- `/dev:setup` - Setup development environment for new contributors

### 📝 Documentation & Planning
- `/bug` - Create standardized bug report template
- `/feature` - Create feature request template
- `/component` - Generate React component template (Mantine or shadcn/ui)
- `/docs:update` - Review and update project documentation

### 🗃️ Database & Infrastructure  
- `/db:backup` - Database backup strategy and guidance

### 💡 Command Usage Tips

**Namespaced Commands:**
- Use `:` for organization (e.g., `/dev:setup`, `/db:backup`)
- Group related commands under common prefixes

**With Arguments:**
- `/component MyComponent` - Creates Mantine component template
- `/component MyComponent ui` - Creates shadcn/ui component template

**Bash Commands:**
- Commands with code blocks execute shell scripts
- Always include error handling and validation
- Provide clear success/failure feedback

## 🏗️ Creating Your Own Commands

### Basic Template Structure:
```markdown
# Command Title

Brief description of what the command does.

Optional code block for bash execution:
```bash
echo "Command output"
```

Additional documentation and usage notes.
```

### File Naming:
- Simple commands: `command-name.md`
- Namespaced: `namespace:command.md`
- Store in `.claude/commands/` directory

### Best Practices:
- Include clear descriptions and usage examples
- Add error handling for bash commands
- Use consistent output formatting (✅ ❌ 🔧 📋 etc.)
- Document any prerequisites or setup requirements

## 🎯 Workflow Integration

These commands integrate with the Fill The Field development workflow:
- Follow the established bug tracking system
- Maintain documentation standards
- Support both Mantine and shadcn/ui component patterns
- Include Supabase-specific guidance where relevant

Use `/status` to get started and see the current project state!