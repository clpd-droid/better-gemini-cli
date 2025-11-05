# 🛍️ MCP Marketplace

Welcome to the MCP Marketplace - your one-stop shop for discovering and
installing Model Context Protocol (MCP) servers for Gemini CLI!

## Quick Start

### Browse Available Servers

```bash
gemini marketplace browse
```

### Search for a Server

```bash
gemini marketplace search github
```

### Install a Server

```bash
gemini marketplace install github
```

That's it! The marketplace will guide you through the configuration process.

## What is the MCP Marketplace?

The MCP Marketplace is a curated collection of high-quality MCP servers that
extend Gemini CLI's capabilities. Instead of manually configuring MCP servers,
you can:

- 🔍 **Discover** - Browse 12+ verified MCP servers
- 📦 **Install** - One-command installation with guided setup
- ✅ **Trust** - All servers are verified and tested
- 📚 **Learn** - Detailed documentation for each server

## Featured Servers

### 🐙 GitHub

Complete GitHub integration - manage repos, issues, and PRs

```bash
gemini marketplace install github
```

### 🗄️ PostgreSQL

Query and manage PostgreSQL databases

```bash
gemini marketplace install postgres
```

### 💬 Slack

Send messages and interact with Slack workspaces

```bash
gemini marketplace install slack
```

### 🤖 Puppeteer

Browser automation and web scraping

```bash
gemini marketplace install puppeteer
```

### 📁 Filesystem

Secure file system operations

```bash
gemini marketplace install filesystem
```

## Categories

Browse servers by category:

```bash
gemini marketplace browse --category database
gemini marketplace browse --category communication
gemini marketplace browse --category automation
```

Available categories:

- 📁 filesystem
- 💻 development
- 🗄️ database
- 💬 communication
- 🤖 automation
- 🔍 search
- 📍 location
- 💾 storage
- 🌐 web
- 🧠 ai
- 🤔 reasoning

## Installation Scopes

Install servers at different scopes:

```bash
# Project-specific (default)
gemini marketplace install github

# User-wide (available in all projects)
gemini marketplace install github --scope user
```

## Trust Mode

Skip confirmation prompts for trusted servers:

```bash
gemini marketplace install filesystem --trust
```

⚠️ **Warning**: Only use `--trust` for servers you completely control.

## Example Workflows

### Setting Up a Development Environment

```bash
# Install GitHub integration
gemini marketplace install github

# Install filesystem tools
gemini marketplace install filesystem

# Install web fetching
gemini marketplace install fetch
```

### Database Development

```bash
# Install PostgreSQL
gemini marketplace install postgres

# Install SQLite
gemini marketplace install sqlite
```

### Communication & Automation

```bash
# Install Slack integration
gemini marketplace install slack

# Install browser automation
gemini marketplace install puppeteer
```

## Managing Installed Servers

After installation, use standard MCP commands:

```bash
# List all servers
gemini mcp list

# Remove a server
gemini mcp remove github
```

## Documentation

For detailed documentation, see:

- [MCP Marketplace Guide](./docs/tools/mcp-marketplace.md)
- [MCP Server Integration](./docs/tools/mcp-server.md)

## Contributing

Want to add your MCP server to the marketplace? See our
[Contributing Guide](./CONTRIBUTING.md) for details on:

- Server requirements
- Verification process
- Submission guidelines

## Support

Having issues?

- Check the
  [Troubleshooting Guide](./docs/tools/mcp-marketplace.md#troubleshooting)
- Use `/bug` command in Gemini CLI
- Open an issue on [GitHub](https://github.com/google-gemini/gemini-cli/issues)

---

**Happy exploring! 🚀**
