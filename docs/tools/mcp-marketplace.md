# MCP Marketplace

The MCP Marketplace is a curated collection of Model Context Protocol (MCP)
servers that you can easily discover, browse, and install into your Gemini CLI.

## Overview

The marketplace provides a streamlined way to:

- **Discover** popular and verified MCP servers
- **Browse** servers by category (filesystem, database, communication, etc.)
- **Search** for servers by name, description, or tags
- **Install** servers with guided configuration
- **View** detailed information about each server

## Commands

### Browse Marketplace

View all available MCP servers in the marketplace:

```bash
gemini marketplace browse
```

**Filter by category:**

```bash
gemini marketplace browse --category database
gemini marketplace browse -c filesystem
```

**Show only verified servers:**

```bash
gemini marketplace browse --verified
```

**Show popular servers:**

```bash
gemini marketplace browse --popular
```

**Show top-rated servers:**

```bash
gemini marketplace browse --top-rated
```

### Search for Servers

Search for MCP servers by name, description, tags, or author:

```bash
gemini marketplace search github
gemini marketplace search "database postgres"
gemini marketplace search slack
```

### View Server Details

Get detailed information about a specific server:

```bash
gemini marketplace info github
gemini marketplace info postgres
gemini marketplace info slack
```

This displays:

- Full description
- Author and verification status
- Available tools
- Required arguments and environment variables
- Installation instructions
- Documentation links

### Install a Server

Install an MCP server from the marketplace:

```bash
gemini marketplace install <server-id>
```

**Options:**

- `--scope, -s`: Configuration scope (`user` or `project`) - default: `project`
- `--trust`: Trust the server (bypass all tool call confirmation prompts)
- `--timeout`: Set connection timeout in milliseconds
- `--yes, -y`: Skip confirmation prompts (use defaults)

**Examples:**

```bash
# Install to project settings (default)
gemini marketplace install github

# Install to user settings
gemini marketplace install postgres --scope user

# Install with trust enabled
gemini marketplace install filesystem --trust

# Install with custom timeout
gemini marketplace install slack --timeout 30000

# Install without prompts (for automation)
gemini marketplace install fetch --yes
```

### Interactive Installation

When you install a server, the CLI will guide you through the configuration:

1. **Required Arguments**: You'll be prompted for any required arguments (e.g.,
   database connection strings, file paths)
2. **Environment Variables**: You'll be asked to provide required API keys or
   tokens
3. **Configuration Summary**: Review your settings before installation
4. **Confirmation**: Confirm the installation

Example installation flow:

```bash
$ gemini marketplace install github

Installing: GitHub MCP Server

Complete GitHub API integration for repositories, issues, PRs, and more

Required Configuration:

Environment Variables:

  Enter value for GITHUB_PERSONAL_ACCESS_TOKEN: ********

Configuration Summary:

  Server: GitHub MCP Server
  Scope: project
  Command: npx -y @modelcontextprotocol/server-github

Proceed with installation? (Y/n) y

✓ Successfully installed GitHub MCP Server!

The server will be available the next time you start Gemini CLI.
```

## Available Categories

The marketplace organizes servers into the following categories:

- 📁 **filesystem** - File system operations
- 💻 **development** - Development tools (Git, GitHub, etc.)
- 🗄️ **database** - Database integrations (PostgreSQL, SQLite, etc.)
- 💬 **communication** - Communication platforms (Slack, etc.)
- 🤖 **automation** - Browser automation and scripting
- 🔍 **search** - Web search services
- 📍 **location** - Location and mapping services
- 💾 **storage** - Persistent storage and memory
- 🌐 **web** - Web fetching and HTTP requests
- 🧠 **ai** - AI and ML services
- 🤔 **reasoning** - Reasoning and problem-solving tools

## Featured Servers

### Filesystem MCP Server

Secure file system operations with configurable access controls.

**Tools:** `read_file`, `write_file`, `edit_file`, `create_directory`,
`list_directory`, `search_files`

```bash
gemini marketplace install filesystem
```

### GitHub MCP Server

Complete GitHub API integration for repositories, issues, PRs, and more.

**Tools:** `create_or_update_file`, `search_repositories`, `create_issue`,
`create_pull_request`

**Required:** `GITHUB_PERSONAL_ACCESS_TOKEN`

```bash
gemini marketplace install github
```

### PostgreSQL MCP Server

Query and manage PostgreSQL databases with schema inspection.

**Tools:** `query`, `list_tables`, `describe_table`, `get_schema`

**Required:** Database connection string

```bash
gemini marketplace install postgres
```

### Slack MCP Server

Send messages, manage channels, and interact with Slack workspaces.

**Tools:** `post_message`, `list_channels`, `get_channel_history`,
`add_reaction`

**Required:** `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`

```bash
gemini marketplace install slack
```

### Puppeteer MCP Server

Browser automation and web scraping with Puppeteer.

**Tools:** `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`,
`puppeteer_fill`

```bash
gemini marketplace install puppeteer
```

## Server Verification

Servers marked with a ✓ are **verified** by the Gemini CLI team. Verified
servers have been:

- Reviewed for security and quality
- Tested for compatibility
- Documented thoroughly
- Maintained by trusted authors

## Managing Installed Servers

After installing servers from the marketplace, you can manage them using the
standard MCP commands:

```bash
# List all configured servers
gemini mcp list

# Remove a server
gemini mcp remove <server-name>
```

## Configuration Files

Marketplace installations update your settings file:

- **Project scope**: `.gemini/settings.json` in your project directory
- **User scope**: `~/.gemini/settings.json` in your home directory

You can manually edit these files to adjust server configurations after
installation.

## Troubleshooting

### Server Not Found

If you get a "Server not found" error:

```bash
# Browse all available servers
gemini marketplace browse

# Search for the server
gemini marketplace search <query>
```

### Installation Fails

If installation fails:

1. Check that you have the required environment variables set
2. Verify you have the necessary permissions
3. Ensure you're in the correct directory for project-scoped installations
4. Try installing with `--scope user` instead

### Server Not Working After Installation

If a server doesn't work after installation:

1. Restart the Gemini CLI
2. Check the server status: `gemini mcp list`
3. Verify your configuration in `settings.json`
4. Check the server's documentation for additional setup steps

## Adding Custom Servers

While the marketplace provides curated servers, you can still add custom MCP
servers using the standard `gemini mcp add` command:

```bash
gemini mcp add my-custom-server /path/to/server --scope user
```

See the [MCP Server documentation](./mcp-server.md) for more details on manual
configuration.

## Contributing to the Marketplace

To suggest a server for inclusion in the marketplace:

1. Ensure your server follows MCP protocol standards
2. Provide comprehensive documentation
3. Submit a pull request to the Gemini CLI repository
4. Include server metadata (description, tools, requirements)

## Related Documentation

- [MCP Server Integration](./mcp-server.md) - Detailed MCP server configuration
- [Custom Commands](../cli/custom-commands.md) - Creating custom slash commands
- [Extensions](../extensions/index.md) - Building Gemini CLI extensions
