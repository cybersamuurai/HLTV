const { gotScraping } = require('got-scraping')
const cheerio = require('cheerio')

async function testPlayerRanking() {
  console.log('Testing Player Ranking page...\n')

  const url = 'https://www.hltv.org/stats/players'

  try {
    console.log('Fetching page...')
    const start = Date.now()

    const response = await gotScraping({
      url,
      timeout: { request: 10000 },
      retry: { limit: 0 }
    })

    const duration = Date.now() - start
    const $ = cheerio.load(response.body)

    console.log(`✓ Page loaded in ${duration}ms`)
    console.log(`Status: ${response.statusCode}`)

    // Check for Cloudflare
    const html = response.body
    if (html.includes('cloudflare') && html.includes('Access denied')) {
      console.log('✗ CLOUDFLARE BLOCKED')
      return
    }

    // Try different selectors
    const selectors = [
      '.player-ratings-table tbody tr',
      '.stats-table tbody tr',
      '.ranked-player',
      '[class*="player"] [class*="rank"]',
      'table tbody tr'
    ]

    console.log('\nTrying different selectors:')
    for (const selector of selectors) {
      const count = $(selector).length
      console.log(`  ${selector}: ${count} elements`)

      if (count > 0 && count < 200) {
        console.log(`\n  Sample HTML from first element:`)
        console.log($(selector).first().html().substring(0, 300))
      }
    }

    // Save full HTML for analysis
    const fs = require('fs')
    fs.writeFileSync('debug-player-ranking-fresh.html', html)
    console.log('\n✓ Saved full HTML to debug-player-ranking-fresh.html')

  } catch (error) {
    console.log(`✗ Error: ${error.message}`)
  }
}

testPlayerRanking()
