# MCP Server Configuration

This document explains how to configure the Mindful Diary MCP server in Claude Desktop.

## What is MCP?

MCP (Model Context Protocol) allows Claude to interact with external services. With this MCP server, Claude can create diary entries directly in your Mindful Diary app.

## Prerequisites

1. Create an API token in the Mindful Diary dashboard (click 🔑 API button)
2. Copy and save the token securely

## Configuration

### For Claude Desktop

Add the following configuration to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mindful-diary": {
      "transport": {
        "type": "http",
        "url": "https://riji.cypggs.com/api/mcp",
        "headers": {
          "Authorization": "Bearer YOUR_TOKEN_HERE"
        }
      }
    }
  }
}
```

Replace `YOUR_TOKEN_HERE` with your actual API token.

### For Local Development

```json
{
  "mcpServers": {
    "mindful-diary": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/api/mcp",
        "headers": {
          "Authorization": "Bearer YOUR_TOKEN_HERE"
        }
      }
    }
  }
}
```

## Usage

After configuring, restart Claude Desktop. You can then ask Claude to:

- "Create a diary entry about my day"
- "Record this thought in my diary: [your thought]"
- "Add a diary entry with a happy mood: [your entry]"

Claude will use the `create_diary_entry` tool to add entries to your Mindful Diary.

## Available Tools

### create_diary_entry

Creates a new diary entry.

**Parameters:**
- `content` (required): The diary entry content (plain text or markdown)
- `mood` (optional): One of: happy, calm, sad, excited, thoughtful, grateful

**Example:**

```
User: "Create a diary entry about my productive day"
Claude: [Uses create_diary_entry tool]
Result: Diary entry created successfully!
```

## Security

- The API token only has permission to create diary entries
- It cannot read or delete existing entries
- Keep your token secure and don't share it
- You can revoke tokens anytime in the dashboard

## Troubleshooting

1. **Connection Failed**: Check that your token is correct and the URL is accessible
2. **401 Unauthorized**: Your token may have been revoked or is invalid
3. **Tool Not Available**: Restart Claude Desktop after updating the config

## API Endpoint

You can also use the REST API directly:

```bash
curl -X POST https://riji.cypggs.com/api/diary/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Today was great!","mood":"happy"}'
```
