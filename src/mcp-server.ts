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
 * Available endpoints (27 total):
 * - Matches: getMatches, getMatch, getResults, getMatchStats, getMatchMapStats, getMatchesStats
 * - Events: getEvents, getEvent, getPastEvents, getEventByName
 * - Teams: getTeamRanking, getTeam, getTeamByName, getTeamStats
 * - Players: getPlayer, getPlayerByName, getPlayerRanking, getPlayerStats
 * - News: getNews, getRecentThreads
 * - Misc: getStreams, connectToScorebot
 * - Fantasy (AUTH REQUIRED): getTournaments, getPlayers, getTeam, createTeam, getLeaderboard
 *
 * Note: Some stats endpoints may be blocked by Cloudflare (getPlayerRanking, getPlayerStats,
 * getMatchStats, getTeamStats). Use Puppeteer mode if needed (set hltvPuppeteerEnabled=true).
 *
 * Fantasy endpoints require authentication. Run `npm run login` first to save credentials.
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
  },
  {
    name: 'hltv_fantasy_get_tournaments',
    description:
      'Get available Fantasy tournaments on HLTV. REQUIRES AUTHENTICATION: Must run npm run login first. Returns tournament ID, name, status, and dates.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'hltv_fantasy_get_players',
    description:
      'Get available players for a Fantasy tournament. REQUIRES AUTHENTICATION. Returns player ID, name, team, price, and points.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentId: {
          type: 'number',
          description: 'Fantasy tournament ID'
        }
      },
      required: ['tournamentId']
    }
  },
  {
    name: 'hltv_fantasy_get_team',
    description:
      'Get your Fantasy team for a tournament. REQUIRES AUTHENTICATION. Returns your team composition, total price, points, and rank.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentId: {
          type: 'number',
          description: 'Fantasy tournament ID'
        }
      },
      required: ['tournamentId']
    }
  },
  {
    name: 'hltv_fantasy_create_team',
    description:
      'Create or update your Fantasy team. REQUIRES AUTHENTICATION. Provide tournament ID and array of 5 player IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentId: {
          type: 'number',
          description: 'Fantasy tournament ID'
        },
        playerIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of 5 player IDs for your team'
        }
      },
      required: ['tournamentId', 'playerIds']
    }
  },
  {
    name: 'hltv_fantasy_get_leaderboard',
    description:
      'Get Fantasy tournament leaderboard. REQUIRES AUTHENTICATION. Returns top players with rank, username, and points.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentId: {
          type: 'number',
          description: 'Fantasy tournament ID'
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)'
        }
      },
      required: ['tournamentId']
    }
  },
  {
    name: 'hltv_get_event_by_name',
    description:
      'Get event information by name. Useful when you have event name but not the ID.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Event name (e.g., "IEM Katowice 2025")'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'hltv_get_player_by_name',
    description:
      'Get player information by nickname. Useful when you have player name but not the ID.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Player nickname (e.g., "s1mple")'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'hltv_get_team_by_name',
    description:
      'Get team information by name. Useful when you have team name but not the ID.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Team name (e.g., "Vitality")'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'hltv_get_match_stats',
    description:
      'Get detailed statistics for a specific match including player performance, maps, and overview. May be blocked by Cloudflare.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Match stats ID'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_match_map_stats',
    description:
      'Get detailed statistics for a specific map in a match. Returns player stats, rounds, and performance.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Map stats ID'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_matches_stats',
    description:
      'Get statistics for multiple matches with filters (date range, team, event, etc). Returns match previews with stats.',
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
    name: 'hltv_get_player_ranking',
    description:
      'Get player rankings with filters (date, map, match type, etc). Returns top players with rating, K/D, maps played. May be blocked by Cloudflare.',
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
        matchType: {
          type: 'string',
          description: 'Match type filter'
        },
        rankingFilter: {
          type: 'string',
          description: 'Ranking filter (e.g., "Top5", "Top10", "Top20", "Top30", "Top50")'
        }
      },
      required: []
    }
  },
  {
    name: 'hltv_get_player_stats',
    description:
      'Get comprehensive statistics for a player including overview, individual stats, and match history. May be blocked by Cloudflare.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Player ID from HLTV'
        },
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format'
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format'
        },
        matchType: {
          type: 'string',
          description: 'Match type filter'
        },
        rankingFilter: {
          type: 'string',
          description: 'Ranking filter'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_get_team_stats',
    description:
      'Get comprehensive statistics for a team including overview, lineup, match history, map stats, and events. May be blocked by Cloudflare.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Team ID from HLTV'
        },
        currentRosterOnly: {
          type: 'boolean',
          description: 'Show stats only for current roster (default: false)'
        },
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format'
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format'
        },
        matchType: {
          type: 'string',
          description: 'Match type filter'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'hltv_connect_to_scorebot',
    description:
      'Connect to live match scorebot for real-time updates. Returns a connection that streams match events. Use for live match tracking.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          description: 'Match ID to connect to'
        }
      },
      required: ['id']
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

      case 'hltv_fantasy_get_tournaments': {
        const tournaments = await hltv.getFantasyTournaments()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tournaments, null, 2)
            }
          ]
        }
      }

      case 'hltv_fantasy_get_players': {
        const schema = z.object({ tournamentId: z.number() })
        const { tournamentId } = schema.parse(args)
        const players = await hltv.getFantasyPlayers({ tournamentId })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(players, null, 2)
            }
          ]
        }
      }

      case 'hltv_fantasy_get_team': {
        const schema = z.object({ tournamentId: z.number() })
        const { tournamentId } = schema.parse(args)
        const team = await hltv.getFantasyTeam(tournamentId)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2)
            }
          ]
        }
      }

      case 'hltv_fantasy_create_team': {
        const schema = z.object({
          tournamentId: z.number(),
          playerIds: z.array(z.number())
        })
        const { tournamentId, playerIds } = schema.parse(args)
        const team = await hltv.createFantasyTeam({ tournamentId, playerIds })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2)
            }
          ]
        }
      }

      case 'hltv_fantasy_get_leaderboard': {
        const schema = z.object({
          tournamentId: z.number(),
          page: z.number().optional()
        })
        const { tournamentId, page } = schema.parse(args)
        const leaderboard = await hltv.getFantasyLeaderboard({ tournamentId, page })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(leaderboard, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_event_by_name': {
        const schema = z.object({ name: z.string() })
        const { name } = schema.parse(args)
        const event = await hltv.getEventByName({ name })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(event, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_player_by_name': {
        const schema = z.object({ name: z.string() })
        const { name } = schema.parse(args)
        const player = await hltv.getPlayerByName({ name })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(player, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_team_by_name': {
        const schema = z.object({ name: z.string() })
        const { name } = schema.parse(args)
        const team = await hltv.getTeamByName({ name })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(team, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_match_stats': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const stats = await hltv.getMatchStats({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_match_map_stats': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        const stats = await hltv.getMatchMapStats({ id })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_matches_stats': {
        const schema = z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          teamIds: z.array(z.number()).optional(),
          eventIds: z.array(z.number()).optional()
        })
        const params = schema.parse(args || {})
        const stats = await hltv.getMatchesStats(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_player_ranking': {
        const schema = z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          matchType: z.any().optional(),
          rankingFilter: z.any().optional()
        })
        const params = schema.parse(args || {})
        const ranking = await hltv.getPlayerRanking(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ranking, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_player_stats': {
        const schema = z.object({
          id: z.number(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          matchType: z.any().optional(),
          rankingFilter: z.any().optional()
        })
        const params = schema.parse(args)
        const stats = await hltv.getPlayerStats(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        }
      }

      case 'hltv_get_team_stats': {
        const schema = z.object({
          id: z.number(),
          currentRosterOnly: z.boolean().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          matchType: z.any().optional()
        })
        const params = schema.parse(args)
        const stats = await hltv.getTeamStats(params)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(stats, null, 2)
            }
          ]
        }
      }

      case 'hltv_connect_to_scorebot': {
        const schema = z.object({ id: z.number() })
        const { id } = schema.parse(args)
        // Note: connectToScorebot returns a connection/emitter, not data directly
        // For MCP we'll return info about starting the connection
        try {
          await hltv.connectToScorebot({ id })
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: 'Scorebot connection initiated for match ' + id,
                  note: 'This is a real-time event emitter connection. In MCP context, this returns immediately but the connection streams events in the background.',
                  status: 'Connected'
                }, null, 2)
              }
            ]
          }
        } catch (error: any) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: 'Failed to connect to scorebot',
                  error: error.message
                }, null, 2)
              }
            ]
          }
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
