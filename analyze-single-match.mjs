import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-matches.html', 'utf-8')
const $ = cheerio.load(html)

const firstMatch = $('[data-match-wrapper]').first()

console.log('='.repeat(60))
console.log('ANALYZING FIRST MATCH IN DETAIL')
console.log('='.repeat(60))

console.log('\nHTML structure (first 3000 chars):')
console.log(firstMatch.html().substring(0, 3000))

console.log('\n\nAll data attributes:')
const el = firstMatch.get(0)
Object.keys(el.attribs).forEach(attr => {
  if (attr.startsWith('data-')) {
    console.log(`  ${attr}: ${el.attribs[attr]}`)
  }
})

console.log('\n\nLooking for team info...')
firstMatch.find('[class*="team"]').each((i, teamEl) => {
  const $team = $(teamEl)
  if ($team.text().trim() && !$team.text().includes('()')) {
    console.log(`  ${teamEl.name}.${$team.attr('class')}:`)
    console.log(`    Text: "${$team.text().trim()}"`)
    console.log(`    data-team-id: ${$team.attr('data-team-id')}`)
  }
})

console.log('\n\nLooking for time/date info...')
firstMatch.find('[class*="time"], [class*="eta"], [data-unix]').each((i, timeEl) => {
  const $time = $(timeEl)
  console.log(`  ${timeEl.name}.${$time.attr('class')}:`)
  console.log(`    Text: "${$time.text().trim()}"`)
  Object.keys(timeEl.attribs).forEach(attr => {
    if (attr.startsWith('data-')) {
      console.log(`    ${attr}: ${timeEl.attribs[attr]}`)
    }
  })
})

console.log('\n\nLooking for format/meta info...')
firstMatch.find('[class*="meta"], [class*="format"]').each((i, metaEl) => {
  const $meta = $(metaEl)
  console.log(`  ${metaEl.name}.${$meta.attr('class')}:`)
  console.log(`    Text: "${$meta.text().trim()}"`)
})

console.log('\n\nAll children of match wrapper:')
firstMatch.children().each((i, child) => {
  const $child = $(child)
  console.log(`  ${child.name}.${$child.attr('class') || '(no class)'}`)
})
