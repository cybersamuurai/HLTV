#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import { HLTV } from './index.js'
import { z } from 'zod'

// Initialize HLTV instance (standard mode, no Puppeteer)
const hltv = HLTV

/**
 * HLTV MCP Server
 *
 * Provides access to CS:GO/CS2 esports data from HLTV.org
 *
 * Available endpoints (12 total):
 * - Matches: getMatches, getMatch, getResults
 * - Events: getEvents, getEvent, getPastEvents
 * - Teams: getTeamRanking, getTeam
 * - Players: getPlayer
 * - News: getNews, getRecentThreads
 * - Misc: getStreams
 *
 * Note: Some endpoints (getPlayerRanking, getPlayerStats, getMatchStats, getTeamStats)
 * are blocked by Cloudflare and not available in this MCP server.
 */

// Define tools
const tools: Tool[] = [
  {
    name: 'hltv_get_matches',
    description:
      'Get all upcoming and live CS:GO/CS2 matches from HLTV. Returns match ID, teams, format, event, time, and star rating.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_get_match',
    description:
      'Get detailed information about a specific match including teams, players, maps, vetos, streams, and odds.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Match ID from HLTV (e.g., 2391612)'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_results',
    description:
      'Get recent match results. Can filter by date, map, team, event, etc. Returns up to 100 results per request.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format'
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format'
        },
        teamIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by team IDs'
        },
        eventIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by event IDs'
        }
      },
      required: []
    }
  },
  {
    name: 'hltv_get_events',
    description:
      'Get all upcoming CS:GO/CS2 tournaments and events. Returns event ID, name, dates, prize pool, location, and teams.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_get_event',
    description:
      'Get detailed information about a specific tournament/event including teams, prize distribution, format, and schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Event ID from HLTV (e.g., 8413)'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_past_events',
    description:
      'Get historical tournaments/events within a date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format (required)'
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (required)'
        }
      },
      required: ['startDate', 'endDate']
    }
  },
  {
    name: 'hltv_get_team_ranking',
    description:
      'Get current HLTV team rankings. Returns top 255 teams with points, rank changes, and roster.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_get_team',
    description:
      'Get detailed information about a specific team including roster, achievements, and statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Team ID from HLTV (e.g., 9565 for Vitality)'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_player',
    description:
      'Get detailed information about a specific player including teams, achievements, and profile data.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Player ID from HLTV (e.g., 7998 for s1mple)'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_news',
    description:
      'Get recent CS:GO/CS2 news articles from HLTV. Returns up to 120 most recent articles.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_get_recent_threads',
    description:
      'Get recent forum discussion threads from HLTV.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_get_streams',
    description:
      'Get currently live CS:GO/CS2 streams on HLTV. Returns stream name, category, viewers, and link.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
]

// Create server instance
const server = new Server(
  {
    name: 'hltv-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools }
})

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'hltv_get_matches': {
        const matches = await hltv.getMatches()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(matches, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_match': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const match = await hltv.getMatch({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(match, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_results': {
        const schema = z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          teamIds: z.array(z.number()).optional(),
          eventIds: z.array(z.number()).optional()
        })
        const params = schema.parse(args || {})
        const results = await hltv.getResults(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_events': {
        const events = await hltv.getEvents()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_event': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const event = await hltv.getEvent({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(event, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_past_events': {
        const schema = z.object({
          startDate: z.string(),
          endDate: z.string()
        })
        const params = schema.parse(args)
        const events = await hltv.getPastEvents(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(events, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_team_ranking': {
        const ranking = await hltv.getTeamRanking()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ranking, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_team': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const team = await hltv.getTeam({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_player': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const player = await hltv.getPlayer({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(player, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_news': {
        const news = await hltv.getNews()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(news, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_recent_threads': {
        const threads = await hltv.getRecentThreads()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(threads, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_streams': {
        const streams = await hltv.getStreams()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(streams, null, 2)
            }
          ]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    }
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('HLTV MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
