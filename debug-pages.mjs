import { gotScraping } from 'got-scraping'
import { writeFileSync } from 'fs'

async function debugPages() {
  const pages = [
    { name: 'matches', url: 'https://www.hltv.org/matches' },
    { name: 'results', url: 'https://www.hltv.org/results' },
    { name: 'player-ranking', url: 'https://www.hltv.org/stats/players' }
  ]

  console.log('Fetching pages for debugging...\n')

  for (const page of pages) {
    try {
      console.log(`Fetching ${page.name}...`)
      const response = await gotScraping({
        url: page.url,
        timeout: { request: 10000 }
      })

      const html = response.body

      // Save to file
      const filename = `debug-${page.name}.html`
      writeFileSync(filename, html)

      console.log(`✓ Saved to ${filename}`)
      console.log(`  Status: ${response.statusCode}`)
      console.log(`  Size: ${html.length} bytes`)

      // Check for Cloudflare
      if (html.includes('cloudflare') || html.includes('Cloudflare')) {
        console.log(`  ⚠ Cloudflare protection detected`)
      }

      // Check for access denied
      if (html.includes('Access denied') || html.includes('access denied')) {
        console.log(`  ✗ Access denied`)
      }

      console.log('')

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`✗ Error fetching ${page.name}:`, error.message)
      console.log('')
    }
  }

  console.log('Done! Check debug-*.html files for page structure')
}

debugPages()
