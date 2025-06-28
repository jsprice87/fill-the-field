# Database Backup Command

Create a backup strategy for Supabase database (development guidance).

## Supabase Backup Strategy

Since Fill The Field uses Supabase, here are the recommended backup approaches:

### Manual Backup Options:

1. **SQL Dump via Dashboard:**
   - Go to Supabase Dashboard → Settings → Database
   - Use "Database" tab to export schema and data

2. **CLI Backup:**
```bash
# Install Supabase CLI if not already installed
# npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (if not already linked)
# supabase link --project-ref YOUR_PROJECT_REF

# Generate migration files from remote database
supabase db diff --schema public --use-migra > backup_$(date +%Y%m%d_%H%M%S).sql

echo "✅ Database backup strategy information provided"
echo "📋 For production, set up automated backups via Supabase Dashboard"
```

### Automated Backup Recommendations:

- **Supabase Pro Plan:** Includes automatic daily backups
- **Point-in-time Recovery:** Available for production databases
- **Manual Snapshots:** Can be created before major deployments

### Data Export Scripts:
```bash
# Example: Export specific tables (requires API keys)
echo "⚠️  For security, backup scripts should be run locally with proper credentials"
echo "📚 Refer to Supabase documentation for automated backup solutions"
```

**Note:** Always use Supabase's built-in backup features for production data.