import { HLTVConfig } from '../config'
import { fetchPage } from '../utils'
import { createAuthenticatedLoadPage } from '../auth/authenticated-load-page'

export interface FantasyLeaderboardEntry {
  rank: number
  username: string
  userId?: number
  points: number
  teamName?: string
}

export interface GetFantasyLeaderboardOptions {
  tournamentId: number
  page?: number
  limit?: number
}

/**
 * Get Fantasy tournament leaderboard
 * Requires authentication
 */
export const getFantasyLeaderboard =
  (config: HLTVConfig) =>
  async (options: GetFantasyLeaderboardOptions): Promise<FantasyLeaderboardEntry[]> => {
    const loadPage = createAuthenticatedLoadPage()

    const page = options.page || 1
    const url = `https://www.hltv.org/fantasy/${options.tournamentId}/leaderboard?page=${page}`

    const $ = await fetchPage(url, loadPage)

    const entries: FantasyLeaderboardEntry[] = []

    // Parse leaderboard entries
    // This will need to be updated based on actual HTML structure
    $('.leaderboard-entry, .fantasy-leaderboard-row').each((_, element) => {
      const rank = parseInt($(element).find('.rank').text().trim())
      const username = $(element).find('.username').text().trim()
      const pointsText = $(element).find('.points').text().trim()
      const points = parseFloat(pointsText.replace(/[^0-9.]/g, ''))

      if (rank && username) {
        entries.push({
          rank,
          username,
          points: points || 0
        })
      }
    })

    return entries
  }
