import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-matches.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Testing new match structure...\n')

const matchWrappers = $('[data-match-wrapper]')
console.log(`Found ${matchWrappers.length} match wrappers\n`)

// Analyze first few matches
matchWrappers.slice(0, 3).each((i, wrapper) => {
  const $wrapper = $(wrapper)

  console.log(`Match ${i + 1}:`)
  console.log(`  Match ID: ${$wrapper.attr('data-match-id')}`)
  console.log(`  Stars: ${$wrapper.attr('data-stars')}`)
  console.log(`  Event ID: ${$wrapper.attr('data-event-id')}`)
  console.log(`  Event Type: ${$wrapper.attr('data-eventtype')}`)
  console.log(`  Region: ${$wrapper.attr('data-region')}`)

  // Find teams
  const teams = $wrapper.find('.match-team')
  console.log(`  Teams found: ${teams.length}`)
  teams.each((j, team) => {
    console.log(`    Team ${j + 1}: ${$(team).find('.match-team-name').text() || $(team).text()}`)
  })

  // Find time
  const time = $wrapper.find('[data-time-format], .match-time, .match-eta')
  console.log(`  Time elements: ${time.length}`)
  time.each((j, t) => {
    const $t = $(t)
    console.log(`    Time ${j}: class="${$t.attr('class')}", text="${$t.text()}"`)
    Object.keys(t.attribs).forEach(attr => {
      if (attr.startsWith('data-')) {
        console.log(`      ${attr}: ${t.attribs[attr]}`)
      }
    })
  })

  // Event info
  const event = $wrapper.find('.match-event')
  console.log(`  Event: ${event.attr('data-event-headline')}`)

  console.log('')
})
