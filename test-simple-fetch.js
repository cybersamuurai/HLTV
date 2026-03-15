const { gotScraping } = require('got-scraping')
const cheerio = require('cheerio')

async function testSimpleFetch() {
  console.log('Testing simple fetch without heavy retries...\n')

  const urls = [
    { name: 'Results', url: 'https://www.hltv.org/results' },
    { name: 'Player Ranking', url: 'https://www.hltv.org/stats/players' }
  ]

  for (const { name, url } of urls) {
    console.log(`Testing: ${name}`)
    console.log(`URL: ${url}`)

    try {
      const start = Date.now()
      const response = await gotScraping({
        url,
        timeout: { request: 30000 },
        retry: { limit: 1 }, // Only 1 retry
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      })

      const duration = Date.now() - start
      const $ = cheerio.load(response.body)

      // Check for Cloudflare
      const html = response.body
      if (html.includes('cloudflare') && (html.includes('Access denied') || html.includes('Checking your browser'))) {
        console.log(`  ✗ CLOUDFLARE BLOCKED (${duration}ms)`)
        console.log(`  Status: ${response.statusCode}`)
        continue
      }

      // Try to parse data
      if (name === 'Results') {
        const results = $('.result-con').length
        console.log(`  ✓ SUCCESS! Found ${results} results (${duration}ms)`)
      } else if (name === 'Player Ranking') {
        const players = $('.player-ratings-table tbody tr').length
        console.log(`  ✓ SUCCESS! Found ${players} players (${duration}ms)`)
      }

    } catch (error) {
      console.log(`  ✗ ERROR: ${error.message}`)
    }

    console.log('')
    await new Promise(r => setTimeout(r, 2000)) // Wait between requests
  }
}

testSimpleFetch()
