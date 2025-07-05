#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Setting up Supabase MCP Configuration...\n");

// Get access token from command line argument or prompt
const accessToken = process.argv[2];

if (!accessToken) {
  console.log(
    "❌ Please provide your Supabase personal access token as an argument.",
  );
  console.log("Usage: node scripts/setup-mcp.js <your-access-token>");
  console.log("\nTo get your access token:");
  console.log("1. Go to https://supabase.com/dashboard/account/tokens");
  console.log("2. Create a new personal access token");
  console.log("3. Copy the token and use it in this command");
  process.exit(1);
}

// Project reference from your existing config
const projectRef = "yjeeamhahyhfawwgebtd";

// Create MCP configuration
const mcpConfig = {
  mcpServers: {
    supabase: {
      command: "cmd",
      args: [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        accessToken,
        "--project-ref",
        projectRef,
      ],
    },
  },
};

// Write configuration to file
const configPath = path.join(__dirname, "..", "mcp-config.json");
fs.writeFileSync(configPath, JSON.stringify(mcpConfig, null, 2));

console.log("✅ MCP configuration created successfully!");
console.log(`📁 Configuration saved to: ${configPath}`);
console.log("\n📋 Next steps:");
console.log("1. Copy the contents of mcp-config.json");
console.log("2. Open Cursor settings (Ctrl/Cmd + ,)");
console.log('3. Search for "MCP" or "Model Context Protocol"');
console.log("4. Add the configuration to your MCP settings");
console.log("5. Restart Cursor");
console.log("\n🔍 Your MCP server will have access to:");
console.log("- Database operations (list_tables, execute_sql, etc.)");
console.log("- Project management (get_project, list_migrations, etc.)");
console.log("- Edge functions (list_edge_functions, deploy_edge_function)");
console.log("- Documentation search (search_docs)");
console.log("- TypeScript type generation (generate_typescript_types)");
