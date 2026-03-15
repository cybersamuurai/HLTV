# HLTV MCP Server for Claude Code

> Access CS:GO/CS2 esports data from HLTV.org directly in Claude Code

[![MCP](https://img.shields.io/badge/MCP-Enabled-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18+-green)](https://nodejs.org/)

## Features

- 🎮 **12 Working Endpoints** - Matches, Events, Teams, Players, News, Streams
- ⚡ **Fast Responses** - 400ms-2s response times
- 🛡️ **No Cloudflare Issues** - Works with stable, non-blocked endpoints
- 🔌 **MCP Protocol** - Native integration with Claude Code
- 📊 **Rich Data** - 496 matches, 255 teams, 136 events, 120 news articles

## Quick Start

### 1. Install

```bash
git clone https://github.com/cybersamuurai/HLTV.git
cd HLTV
npm install
npm run build
```

### 2. Configure Claude Code

Add to your Claude Code settings:

**macOS/Linux:** `~/.config/claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "hltv": {
      "command": "node",
      "args": [
        "/absolute/path/to/HLTV/lib/mcp-server.js"
      ]
    }
  }
}
```

### 3. Restart Claude Code

The HLTV tools will be available in Claude Code.

## Available Tools

### 🎯 Matches (3)
- `hltv_get_matches` - All upcoming/live matches (496 matches, ~1s)
- `hltv_get_match` - Detailed match info by ID (~1.5s)
- `hltv_get_results` - Historical results with filters (~1s)

### 🏆 Events (3)
- `hltv_get_events` - Upcoming tournaments (136 events, ~400ms)
- `hltv_get_event` - Event details by ID (~2s)
- `hltv_get_past_events` - Historical events (~1.4s)

### 👥 Teams (2)
- `hltv_get_team_ranking` - Current rankings (255 teams, ~500ms)
- `hltv_get_team` - Team details by ID (~1.5s)

### 🎮 Players (1)
- `hltv_get_player` - Player details by ID (~650ms)

### 📰 News (2)
- `hltv_get_news` - Recent articles (120 items, ~450ms)
- `hltv_get_recent_threads` - Forum threads (~400ms)

### 📺 Streams (1)
- `hltv_get_streams` - Live streams (128 streams, ~600ms)

## Example Queries

Ask Claude Code:

```
"Show me upcoming CS2 matches today"
"What are the current top 10 teams?"
"Get recent news about NAVI"
"Find all matches from ESL Pro League"
"Show me live CS2 streams"
```

## Performance

| Endpoint Category | Response Time | Data Volume |
|------------------|---------------|-------------|
| News, Rankings   | 400-600ms     | 100-250 items |
| Match/Team/Player Details | 1-2s | Single entity |
| Results (paginated) | ~1s | 100 items/page |

## Limitations

### ❌ Cloudflare-Blocked Endpoints (Not Available)

These endpoints require browser automation and **do not work** in headless mode:

- `getPlayerRanking` - Player rankings
- `getPlayerStats` - Player statistics
- `getMatchStats` - Match statistics
- `getTeamStats` - Team statistics

**Reason:** HLTV.org uses Cloudflare protection that detects headless browsers.

**Workaround:** Use available endpoints like `getTeamRanking` and `getPlayer` for basic info.

## Architecture

```
┌─────────────────┐
│  Claude Code    │
└────────┬────────┘
         │ MCP Protocol (stdio)
┌────────▼────────┐
│  MCP Server     │ (lib/mcp-server.js)
│  - 12 tools     │
│  - Zod schemas  │
└────────┬────────┘
         │
┌────────▼────────┐
│  HLTV Library   │ (got-scraping + cheerio)
│  - HTTP client  │
│  - HTML parser  │
└────────┬────────┘
         │
┌────────▼────────┐
│   HLTV.org      │
└─────────────────┘
```

## Development

### Test MCP Server

```bash
# Quick test (6 endpoints, <5s)
node quick-test.js

# Full test (12 endpoints)
node all-endpoints-test.js
```

### Rebuild After Changes

```bash
npm run build
```

### Debug MCP Server

```bash
# Run directly (will wait for stdio input)
node lib/mcp-server.js
```

## Troubleshooting

### "Server not found"
- Check path in `claude_desktop_config.json`
- Ensure `npm run build` completed
- Verify `lib/mcp-server.js` exists

### Slow responses
- Normal: 0.4-2 seconds
- Check network to hltv.org
- Some endpoints return large datasets

### Cloudflare errors
- Expected for stats endpoints
- 12 main tools should work fine
- Wait a few seconds and retry

## Tech Stack

- **MCP SDK:** `@modelcontextprotocol/sdk` ^1.27.1
- **Validation:** `zod` ^4.3.6
- **HTTP:** `got-scraping` ^3.2.13
- **Parser:** `cheerio` 1.0.0
- **Runtime:** Node.js 18+

## Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Core Library | ✅ Working | 75% endpoints functional |
| MCP Server | ✅ Working | 12 tools available |
| Cloudflare Bypass | ❌ Headless Failed | Only non-headless works |
| Documentation | ✅ Complete | Setup guides included |

## Credits

- **HLTV Library:** [gigobyte/HLTV](https://github.com/gigobyte/HLTV) by Stanislav Iliev
- **MCP Integration:** Claude Code MCP Server implementation
- **Cloudflare Research:** puppeteer-real-browser testing

## License

ISC

## Links

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Code](https://claude.com/claude-code)
- [HLTV.org](https://hltv.org)
- [Issues](https://github.com/cybersamuurai/HLTV/issues)

---

**Built with ❤️ for the CS2 esports community**
