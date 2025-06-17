# Supabase MCP Setup Guide

This guide will help you connect your Certifyr project to Supabase using the Model Context Protocol (MCP).

## Prerequisites

- Node.js installed on your machine
- Supabase personal access token
- Cursor IDE

## Step 1: Get Your Supabase Personal Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
2. Click "Generate new token"
3. Give it a name like "Cursor MCP Server"
4. Copy the token (you won't be able to see it again)

## Step 2: Run the Setup Script

Since you have your access token ready, run:

```bash
node scripts/setup-mcp.js sbp_9b6b69215978169f81e3b2ca93d83095e6c1dd29
```

Replace `<your-personal-access-token>` with the token you copied in Step 1.

## Step 3: Configure Cursor

1. Open Cursor settings (`Ctrl + ,`)
2. Search for "MCP" or "Model Context Protocol"
3. Add the configuration from the generated `mcp-config.json` file
4. Restart Cursor

## Step 4: Verify Connection

Once configured, you can test the connection by asking Cursor to:
- List your database tables
- Execute SQL queries
- Search Supabase documentation
- Generate TypeScript types

## Available MCP Tools

Your MCP server will have access to these Supabase tools:

### Database Operations
- `list_tables` - Lists all tables in your database
- `execute_sql` - Execute raw SQL queries
- `apply_migration` - Apply schema migrations
- `list_migrations` - List all migrations
- `list_extensions` - List database extensions

### Project Management
- `get_project` - Get project details
- `get_project_url` - Get API URL
- `get_anon_key` - Get anonymous API key
- `get_logs` - Get service logs
- `get_advisors` - Get advisory notices

### Edge Functions
- `list_edge_functions` - List all edge functions
- `deploy_edge_function` - Deploy new functions

### Development Tools
- `search_docs` - Search Supabase documentation
- `generate_typescript_types` - Generate TypeScript types

## Troubleshooting

### Windows PATH Issues
If you encounter PATH issues on Windows:

1. Get npm path: `npm config get prefix`
2. Add to PATH: `setx PATH "%PATH%;<path-to-dir>"`
3. Restart Cursor

### Alternative Configuration
If the setup script doesn't work, you can manually create the configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_9b6b69215978169f81e3b2ca93d83095e6c1dd29",
        "--project-ref",
        "yjeeamhahyhfawwgebtd"
      ]
    }
  }
}
```

## Security Notes

- Keep your access token secure
- Consider using environment variables for the token
- The MCP server is scoped to your specific project
- You can add `--read-only` flag for read-only access

## Project Reference

Your project reference: `yjeeamhahyhfawwgebtd`

This is extracted from your existing Supabase configuration in `src/integrations/supabase/client.ts`. 