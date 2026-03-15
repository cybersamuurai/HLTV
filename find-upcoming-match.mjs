import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-matches.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Looking for upcoming (non-live) matches...\n')

const matches = $('[data-match-wrapper]')
let foundUpcoming = 0

matches.each((i, wrapper) => {
  const $wrapper = $(wrapper)
  const metaText = $wrapper.find('.match-meta').first().text().trim().toLowerCase()

  if (metaText !== 'live' && foundUpcoming < 3) {
    foundUpcoming++
    console.log('='.repeat(60))
    console.log(`UPCOMING MATCH ${foundUpcoming}`)
    console.log('='.repeat(60))
    console.log('\nHTML (first 2000 chars):')
    console.log($wrapper.html().substring(0, 2000))

    console.log('\n\nLooking for time/date elements:')
    $wrapper.find('*').each((j, el) => {
      const $el = $(el)
      const text = $el.text().trim()
      const className = $el.attr('class') || ''

      // Look for time-related classes or attributes
      if (className.includes('time') || className.includes('eta') || className.includes('date') ||
          text.match(/^\d{1,2}:\d{2}/) || text.match(/today|tomorrow/i) ||
          Object.keys(el.attribs).some(attr => attr.includes('unix') || attr.includes('time'))) {
        console.log(`  ${el.name}.${className}:`)
        console.log(`    Text: "${text}"`)
        Object.keys(el.attribs).forEach(attr => {
          if (attr.startsWith('data-')) {
            console.log(`    ${attr}: ${el.attribs[attr]}`)
          }
        })
      }
    })
    console.log('')
  }
})

if (foundUpcoming === 0) {
  console.log('No upcoming matches found, all matches are live')
}
