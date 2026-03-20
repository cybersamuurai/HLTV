import { HLTVConfig } from '../config'
import { fetchPage } from '../utils'
import { createAuthenticatedLoadPage } from '../auth/authenticated-load-page'

export interface FantasyTournament {
  id: number
  name: string
  startDate?: number
  endDate?: number
  status: 'upcoming' | 'active' | 'completed'
  totalTeams?: number
  prize?: string
}

/**
 * Get available Fantasy tournaments
 * Requires authentication
 */
export const getFantasyTournaments =
  (config: HLTVConfig) => async (): Promise<FantasyTournament[]> => {
    const loadPage = createAuthenticatedLoadPage()
    const $ = await fetchPage('https://www.hltv.org/fantasy', loadPage)

    const tournaments: FantasyTournament[] = []

    // Parse fantasy tournaments from the page
    // This will need to be updated based on actual HTML structure
    $('.fantasy-tournament').each((_, element) => {
      const id = parseInt($(element).attr('data-tournament-id') || '0')
      const name = $(element).find('.tournament-name').text().trim()
      const status = $(element).hasClass('active')
        ? 'active'
        : $(element).hasClass('completed')
        ? 'completed'
        : 'upcoming'

      if (id && name) {
        tournaments.push({
          id,
          name,
          status
        })
      }
    })

    return tournaments
  }
