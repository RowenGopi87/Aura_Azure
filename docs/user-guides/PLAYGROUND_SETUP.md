# 🎮 Aura Playground Setup Guide

This guide will help you set up a complete copy of the Aura SDLC database as a playground environment for development and testing.

## 🎯 Overview

The Aura Playground is a separate database environment that allows you to:
- Make changes safely without affecting production data
- Test new features and database modifications
- Experiment with different configurations
- Develop and debug in isolation

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the PowerShell setup script:

```powershell
.\setup-playground.ps1
```

This will:
1. Create the `aura_playground` database
2. Clone data from `aura_sdlc` (if it exists)
3. Set up all necessary tables and procedures
4. Configure user permissions

### Option 2: Manual Setup

1. **Create the playground database:**
   ```sql
   mysql -u root -e "source setup-aura-playground-database.sql"
   ```

2. **If you have existing data to clone:**
   ```sql
   mysql -u root -e "source clone-database-to-playground.sql"
   ```

3. **Run the database setup scripts:**
   ```powershell
   cd database/setup
   .\setup.ps1
   ```

## 🔧 Environment Configuration

### Update your .env file

Copy the contents of `aura-database.env` to your `.env` file:

```env
AURA_DB_HOST=127.0.0.1
AURA_DB_PORT=3306
AURA_DB_USER=aura_user
AURA_DB_PASSWORD=aura_password_123
AURA_DB_NAME=aura_playground
AURA_DB_MAX_POOL_SIZE=10
AURA_DB_SSL=false
```

### Key Differences from Production

| Setting | Production | Playground |
|---------|------------|------------|
| Database Name | `aura_sdlc` | `aura_playground` |
| Purpose | Production data | Development/Testing |
| Safety | High caution | Safe to experiment |

## 📊 Database Structure

The playground database includes all the same tables and structures as production:

- **Work Items Management**
  - `initiatives`
  - `epics` 
  - `features`
  - `user_stories`
  - `test_cases`
  - `defects`

- **Business Analysis**
  - `business_briefs`
  - `requirements`
  - `use_cases`

- **Vector Storage** (for RAG/AI features)
  - `document_embeddings`
  - `vector_stores`

- **AuraV2 Tables**
  - `aurav2_ideas`
  - `aurav2_workflows`
  - `aurav2_workflow_stages`

## 🧪 Testing Your Setup

1. **Test database connectivity:**
   ```bash
   npm run dev
   ```
   Then visit: http://localhost:3000/api/database/health

2. **Verify tables:**
   ```sql
   mysql -u aura_user -paura_password_123 -e "SHOW TABLES FROM aura_playground;"
   ```

3. **Check data migration:**
   ```sql
   mysql -u aura_user -paura_password_123 -e "SELECT COUNT(*) FROM aura_playground.business_briefs;"
   ```

## 🔄 Development Workflow

### Making Changes

1. **Make your changes** in the playground environment
2. **Test thoroughly** using the playground database
3. **Document changes** for easy merging back to production
4. **Export schema changes** when ready to merge

### Syncing with Production

When you're ready to merge changes back:

```sql
-- Export your schema changes
mysqldump -u aura_user -paura_password_123 --no-data --routines aura_playground > playground_schema.sql

-- Export new data if needed
mysqldump -u aura_user -paura_password_123 --no-create-info aura_playground table_name > playground_data.sql
```

## 🛠️ Available Scripts

### Database Scripts

| Script | Description |
|--------|-------------|
| `setup-playground.ps1` | Complete automated setup |
| `setup-aura-playground-database.sql` | Basic database and user creation |
| `clone-database-to-playground.sql` | Clone existing data |
| `database/setup/setup.ps1` | Run all setup scripts |

### Application Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `start-aura-with-mcp.bat` | Start with MCP integration |

## 🚨 Troubleshooting

### Common Issues

**1. "Database connection failed"**
- Check if MariaDB service is running
- Verify credentials in `.env` file
- Test connection: `mysql -u aura_user -paura_password_123 -h 127.0.0.1`

**2. "Table doesn't exist"**
- Run the database setup scripts: `cd database/setup && .\setup.ps1`
- Check if database was created: `SHOW DATABASES LIKE 'aura_playground';`

**3. "Permission denied"**
- Verify user permissions: `SHOW GRANTS FOR 'aura_user'@'localhost';`
- Re-run user setup: `mysql -u root -e "source database/setup/02-create-users.sql"`

**4. "No data in tables"**
- Check if source database exists: `SHOW DATABASES LIKE 'aura_sdlc';`
- Run data migration: `mysql -u root -e "source clone-database-to-playground.sql"`

### Getting Help

1. Check the logs in the terminal
2. Test individual components using the API endpoints
3. Verify environment variables are loaded correctly
4. Check MariaDB error logs

## 📁 File Structure

```
Aura-Playground/
├── setup-playground.ps1           # Main setup script
├── setup-aura-playground-database.sql  # Database creation
├── clone-database-to-playground.sql    # Data cloning
├── aura-database.env              # Environment configuration
├── database/
│   └── setup/                     # Database setup scripts
│       ├── 01-create-database.sql
│       ├── 02-create-users.sql
│       ├── 03-create-tables.sql
│       └── ...
└── src/
    └── lib/
        └── database/              # Database connection code
```

## 🎉 Success!

Once setup is complete, you should see:
- ✅ Database `aura_playground` created
- ✅ User permissions configured
- ✅ All tables and procedures installed
- ✅ Data migrated (if source exists)
- ✅ Application connects successfully

You're now ready to develop in the playground environment! 🚀

## 🔄 Next Steps

1. Start making your changes
2. Test thoroughly in the playground
3. Document your modifications
4. When ready, merge back to production
5. Celebrate! 🎉

---

**Happy coding in your new playground! 🎮✨**
