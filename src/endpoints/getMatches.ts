import { stringify } from 'querystring'
import { HLTVConfig } from '../config'
import { HLTVScraper } from '../scraper'
import { Team } from '../shared/Team'
import { Event } from '../shared/Event'
import { fetchPage, getIdAt } from '../utils'

export enum MatchEventType {
  All = 'All',
  LAN = 'Lan',
  Online = 'Online'
}

export enum MatchFilter {
  LanOnly = 'lan_only',
  TopTier = 'top_tier'
}

export interface GetMatchesArguments {
  eventIds?: number[]
  eventType?: MatchEventType
  filter?: MatchFilter
  teamIds?: number[]
}

export interface MatchPreview {
  id: number
  team1?: Team
  team2?: Team
  date?: number
  format?: string
  event?: Event
  title?: string
  live: boolean
  stars: number
}

export const getMatches =
  (config: HLTVConfig) =>
  async ({
    eventIds,
    eventType,
    filter,
    teamIds
  }: GetMatchesArguments = {}): Promise<MatchPreview[]> => {
    const query = stringify({
      ...(eventIds ? { event: eventIds } : {}),
      ...(eventType ? { eventType } : {}),
      ...(filter ? { predefinedFilter: filter } : {}),
      ...(teamIds ? { team: teamIds } : {})
    })

    const $ = HLTVScraper(
      await fetchPage(`https://www.hltv.org/matches?${query}`, config.loadPage)
    )

    const events = $('.event-filter-popup a')
      .toArray()
      .map((el) => ({
        id: el.attrThen('href', (x) => Number(x.split('=').pop())),
        name: el.find('.event-name').text()
      }))
      .concat(
        $('.events-container a')
          .toArray()
          .map((el) => ({
            id: el.attrThen('href', (x) => Number(x.split('=').pop())),
            name: el.find('.featured-event-tooltip-content').text()
          }))
      )

    return $('[data-match-wrapper]')
      .toArray()
      .map((el) => {
        const id = el.numFromAttr('data-match-id')!

        // Parse stars from match-rating - count non-faded stars
        const starElements = el.find('.match-rating i.fa-star')
        const fadedStars = el.find('.match-rating i.fa-star.faded').length
        const totalStars = starElements.length
        const stars = totalStars > 0 ? totalStars - fadedStars : (el.numFromAttr('data-stars') || 0)

        // Check if match is live
        const metaText = el.find('.match-meta').first().text().trim().toLowerCase()
        const isLive = metaText === 'live'

        // Get team names from .match-teamname
        const teamElements = el.find('.match-teamname').toArray()
        const teamNames = teamElements.map((t) => t.text().trim()).filter(Boolean)

        // Check if match is TBD or placeholder (e.g., "Team1/Team2 winner")
        const placeholderText = el.find('.team.text-ellipsis').text().trim()
        const title = (teamNames.length < 2 || placeholderText.includes('/')) ?
          (placeholderText || el.find('.match-info-empty, .line-up-container').text().trim() || undefined) :
          undefined

        // Get date/time from .match-time element
        let date: number | undefined
        const timeEl = el.find('.match-time[data-unix]')
        if (timeEl.exists()) {
          date = timeEl.numFromAttr('data-unix')
        }

        let team1: Team | undefined
        let team2: Team | undefined

        if (!title && teamNames.length >= 2) {
          team1 = {
            name: teamNames[0],
            id: undefined
          }

          team2 = {
            name: teamNames[1],
            id: undefined
          }
        }

        // Get format - usually second .match-meta element or first if only one exists
        const metaElements = el.find('.match-meta').toArray()
        const format = metaElements.length > 1 ?
          metaElements[1].text().trim() :
          (metaElements.length === 1 && !isLive ? metaElements[0].text().trim() : undefined)

        // Get event info
        const eventName = el.find('.match-event').attr('data-event-headline') ||
                         el.find('.match-event-logo').attr('title')
        const eventId = el.numFromAttr('data-event-id')
        const event = eventId ? { id: eventId, name: eventName || '' } : events.find((x) => x.name === eventName)

        return { id, date, stars, title, team1, team2, format, event, live: isLive }
      })
  }
