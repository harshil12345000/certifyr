# Quick Supabase MCP Setup

## You're Ready to Connect! 🚀

Since you have your access token ready, follow these steps:

### Step 1: Create Your MCP Configuration

1. Copy the contents of `mcp-config-template.json`
2. Replace `REPLACE_WITH_YOUR_ACCESS_TOKEN` with your actual access token
3. Save it as `mcp-config.json` in your project root

### Step 2: Configure Cursor

1. Open Cursor settings (`Ctrl + ,`)
2. Search for "MCP" or "Model Context Protocol"
3. Add the configuration from your `mcp-config.json` file
4. Restart Cursor

### Step 3: Test the Connection

Once configured, try asking Cursor:
- "List all tables in my Supabase database"
- "Show me my project details"
- "Search Supabase docs for authentication"

## Your Project Details

- **Project Reference**: `yjeeamhahyhfawwgebtd`
- **Current Supabase URL**: `https://yjeeamhahyhfawwgebtd.supabase.co`
- **Configuration File**: `src/integrations/supabase/client.ts`

## Available Tools

Your MCP server will give Cursor access to:
- ✅ Database operations (SQL queries, migrations)
- ✅ Project management (logs, settings)
- ✅ Edge functions (deploy, list)
- ✅ Documentation search
- ✅ TypeScript type generation

## Need Help?

- Check `MCP_SETUP.md` for detailed instructions
- Run `node scripts/setup-mcp.js <your-token>` for automated setup
- Visit [Supabase MCP Documentation](https://github.com/supabase-community/supabase-mcp) 