import { HLTVConfig } from '../config'
import { authenticatedPost } from '../auth/authenticated-load-page'

export interface FantasyTeamPlayer {
  playerId: number
  playerName: string
  position: string
  price: number
}

export interface FantasyTeam {
  tournamentId: number
  tournamentName: string
  players: FantasyTeamPlayer[]
  totalPrice: number
  totalPoints?: number
  rank?: number
}

/**
 * Get user's Fantasy team for a tournament
 * Requires authentication
 */
export const getFantasyTeam =
  (config: HLTVConfig) =>
  async (tournamentId: number): Promise<FantasyTeam | null> => {
    try {
      // This endpoint will need to be discovered through research
      const response = await authenticatedPost(
        'https://www.hltv.org/api/fantasy/team/get',
        { tournamentId }
      )

      if (!response || !response.team) {
        return null
      }

      return {
        tournamentId: response.tournamentId,
        tournamentName: response.tournamentName || '',
        players: response.team.players || [],
        totalPrice: response.team.totalPrice || 0,
        totalPoints: response.team.totalPoints,
        rank: response.team.rank
      }
    } catch (error) {
      // Team not created yet
      return null
    }
  }

export interface CreateFantasyTeamOptions {
  tournamentId: number
  playerIds: number[]
}

/**
 * Create or update user's Fantasy team
 * Requires authentication
 */
export const createFantasyTeam =
  (config: HLTVConfig) =>
  async (options: CreateFantasyTeamOptions): Promise<FantasyTeam> => {
    // This endpoint will need to be discovered through research
    const response = await authenticatedPost(
      'https://www.hltv.org/api/fantasy/team/save',
      {
        tournamentId: options.tournamentId,
        playerIds: options.playerIds
      }
    )

    return {
      tournamentId: response.tournamentId,
      tournamentName: response.tournamentName || '',
      players: response.team.players || [],
      totalPrice: response.team.totalPrice || 0,
      totalPoints: response.team.totalPoints,
      rank: response.team.rank
    }
  }
