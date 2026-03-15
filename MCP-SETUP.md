# HLTV MCP Server - Setup Guide

## Quick Start

The HLTV MCP Server provides Claude Code with access to CS:GO/CS2 esports data from HLTV.org.

### Installation

1. **Install dependencies:**
```bash
npm install
npm run build
```

2. **Configure Claude Code:**

Add to your Claude Code settings (`~/.config/claude/claude_desktop_config.json` or similar):

```json
{
  "mcpServers": {
    "hltv": {
      "command": "node",
      "args": [
        "C:\\Users\\vokku\\git\\mcp\\HLTV\\lib\\mcp-server.js"
      ]
    }
  }
}
```

**Note:** Replace the path with your actual HLTV repository location.

3. **Restart Claude Code**

### Available Tools

The MCP server provides 12 tools for accessing HLTV data:

#### Matches (3 tools)
- `hltv_get_matches` - Get all upcoming and live matches (~1s, 496 matches)
- `hltv_get_match` - Get detailed match information (~1.5s)
- `hltv_get_results` - Get recent match results with filters (~1s, 100 results per page)

#### Events (3 tools)
- `hltv_get_events` - Get upcoming tournaments (~400ms, 136 events)
- `hltv_get_event` - Get detailed event information (~2s)
- `hltv_get_past_events` - Get historical events by date range (~1.4s)

#### Teams (2 tools)
- `hltv_get_team_ranking` - Get current HLTV team rankings (~500ms, 255 teams)
- `hltv_get_team` - Get detailed team information (~1.5s)

#### Players (1 tool)
- `hltv_get_player` - Get detailed player information (~650ms)

#### News (2 tools)
- `hltv_get_news` - Get recent news articles (~450ms, 120 articles)
- `hltv_get_recent_threads` - Get recent forum threads (~400ms)

#### Misc (1 tool)
- `hltv_get_streams` - Get currently live streams (~600ms, 128 streams)

### Example Usage in Claude Code

**Get upcoming matches:**
```
Show me upcoming CS2 matches
```

**Get team rankings:**
```
What are the current top 10 CS2 teams?
```

**Find player info:**
```
Get information about player s1mple (ID: 7998)
```

**Filter results:**
```
Show me match results from last week for Vitality (team ID: 9565)
```

## Performance

All endpoints respond in under 2 seconds:
- News, events, rankings: **400-600ms**
- Match/team/player details: **1-2s**
- Results with pagination: **~1s per 100 results**

## Limitations

### Cloudflare-Blocked Endpoints (Not Available)

The following endpoints require browser automation and are **not available** in this MCP server:

- ❌ `getPlayerRanking` - Player rankings (Cloudflare protected)
- ❌ `getPlayerStats` - Player statistics (Cloudflare protected)
- ❌ `getMatchStats` - Match statistics (Cloudflare protected)
- ❌ `getTeamStats` - Team statistics (Cloudflare protected)

**Reason:** HLTV.org uses Cloudflare protection on `/stats/*` endpoints which cannot be bypassed in headless mode.

**Workaround:** Use `getTeamRanking` and `getPlayer` for basic team/player information.

## Troubleshooting

### Server not connecting

1. Check the path in `claude_desktop_config.json` is correct
2. Ensure `npm run build` completed successfully
3. Check `lib/mcp-server.js` exists

### Slow responses

- Normal response times: 0.4-2 seconds
- If consistently slower: check network connection to hltv.org
- Some endpoints return large datasets (100+ items)

### Error: "Access denied"

If you see Cloudflare errors:
- This is expected for blocked endpoints (stats)
- The 12 available tools should work without issues
- Try again after a few seconds (rate limiting)

## Advanced Configuration

### Custom HLTV Instance

To use custom configuration (proxy, timeout, etc), modify `src/mcp-server.ts`:

```typescript
// Custom HLTV instance with options
const hltv = new HLTV({
  loadPage: customLoadPageFunction,
  httpAgent: customAgent
})
```

Then rebuild:
```bash
npm run build
```

### Rate Limiting

The server uses built-in delays (100-200ms) between requests to avoid triggering HLTV rate limits. No additional configuration needed.

## Development

### Run MCP server directly:
```bash
node lib/mcp-server.js
```

### Test endpoints:
```bash
node quick-test.js  # Test non-Cloudflare endpoints
```

### Rebuild after changes:
```bash
npm run build
```

## Support

- GitHub Issues: https://github.com/cybersamuurai/HLTV/issues
- Original HLTV Library: https://github.com/gigobyte/HLTV

## Credits

Built on top of the [HLTV Node.js API](https://github.com/gigobyte/HLTV) by Stanislav Iliev.

MCP integration by Claude Code team.
