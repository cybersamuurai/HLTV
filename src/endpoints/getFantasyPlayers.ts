import { HLTVConfig } from '../config'
import { fetchPage } from '../utils'
import { createAuthenticatedLoadPage } from '../auth/authenticated-load-page'

export interface FantasyPlayer {
  id: number
  name: string
  team?: string
  teamId?: number
  price: number
  points?: number
  position?: string
  photoUrl?: string
}

export interface GetFantasyPlayersOptions {
  tournamentId: number
  filterByTeam?: number
  sortBy?: 'price' | 'points' | 'name'
}

/**
 * Get available players for Fantasy tournament
 * Requires authentication
 */
export const getFantasyPlayers =
  (config: HLTVConfig) =>
  async (options: GetFantasyPlayersOptions): Promise<FantasyPlayer[]> => {
    const loadPage = createAuthenticatedLoadPage()

    const url = `https://www.hltv.org/fantasy/${options.tournamentId}/players`
    const $ = await fetchPage(url, loadPage)

    const players: FantasyPlayer[] = []

    // Parse players from the page
    // This will need to be updated based on actual HTML structure
    $('.fantasy-player').each((_, element) => {
      const id = parseInt($(element).attr('data-player-id') || '0')
      const name = $(element).find('.player-name').text().trim()
      const team = $(element).find('.team-name').text().trim()
      const priceText = $(element).find('.player-price').text().trim()
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

      if (id && name) {
        players.push({
          id,
          name,
          team,
          price: price || 0
        })
      }
    })

    return players
  }
