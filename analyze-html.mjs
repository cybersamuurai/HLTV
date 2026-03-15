import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

function analyzeMatches() {
  console.log('='.repeat(60))
  console.log('ANALYZING: matches page')
  console.log('='.repeat(60))

  const html = readFileSync('debug-matches.html', 'utf-8')
  const $ = cheerio.load(html)

  console.log('\nLooking for match containers...')

  const liveMatches = $('.liveMatch-container')
  console.log(`  .liveMatch-container: ${liveMatches.length} found`)

  const upcomingMatches = $('.upcomingMatch')
  console.log(`  .upcomingMatch: ${upcomingMatches.length} found`)

  const matchCards = $('.match-card')
  console.log(`  .match-card: ${matchCards.length} found`)

  const allMatches = $('.allmatches .match')
  console.log(`  .allmatches .match: ${allMatches.length} found`)

  // Try to find any divs with "match" in class name
  const anyMatch = $('[class*="match"]').length
  console.log(`  Elements with "match" in class: ${anyMatch} found`)

  // List some class names
  console.log('\nSample class names containing "match":')
  $('[class*="match"]').slice(0, 10).each((i, el) => {
    console.log(`    ${$(el).attr('class')}`)
  })

  console.log('')
}

function analyzeResults() {
  console.log('='.repeat(60))
  console.log('ANALYZING: results page')
  console.log('='.repeat(60))

  const html = readFileSync('debug-results.html', 'utf-8')
  const $ = cheerio.load(html)

  console.log('\nLooking for result containers...')

  const resultCon = $('.result-con')
  console.log(`  .result-con: ${resultCon.length} found`)

  const bigResults = $('.big-results .result-con')
  console.log(`  .big-results .result-con: ${bigResults.length} found`)

  if (resultCon.length > 0) {
    console.log('\nFirst result structure:')
    const first = resultCon.first()
    console.log('  HTML:', first.html().substring(0, 500))
    console.log('  data-zonedgrouping-entry-unix:', first.attr('data-zonedgrouping-entry-unix'))
  }

  console.log('')
}

function analyzePlayerRanking() {
  console.log('='.repeat(60))
  console.log('ANALYZING: player ranking page')
  console.log('='.repeat(60))

  const html = readFileSync('debug-player-ranking.html', 'utf-8')
  const $ = cheerio.load(html)

  console.log('\nChecking for access denied...')

  if (html.includes('Access denied')) {
    console.log('  ✗ ACCESS DENIED - Cloudflare blocked the request')
    console.log('  Page title:', $('title').text())
    console.log('  Page size:', html.length, 'bytes')
  }

  console.log('\nLooking for player table...')
  const table = $('.player-ratings-table tbody tr')
  console.log(`  .player-ratings-table tbody tr: ${table.length} found`)

  console.log('')
}

try {
  analyzeMatches()
  analyzeResults()
  analyzePlayerRanking()
} catch (error) {
  console.error('Error:', error.message)
}
