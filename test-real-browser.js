const { connect } = require('puppeteer-real-browser')
const cheerio = require('cheerio')

async function testRealBrowser() {
  console.log('Testing puppeteer-real-browser for Cloudflare bypass...\n')

  const url = 'https://www.hltv.org/stats/players'
  let browser, page

  try {
    console.log('Launching real browser...')
    const startLaunch = Date.now()

    const { browser: br, page: pg } = await connect({
      headless: false,
      args: ['--start-maximized'],
      customConfig: {},
      turnstile: true,
      connectOption: {},
      disableXvfb: false,
      ignoreAllFlags: false
    })

    browser = br
    page = pg

    console.log(`✓ Browser launched in ${Date.now() - startLaunch}ms\n`)

    console.log('Navigating to player ranking page...')
    const startNav = Date.now()

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    })

    console.log(`✓ Page loaded in ${Date.now() - startNav}ms\n`)

    // Wait a bit for any challenges to complete
    console.log('Waiting for page to fully load (5s)...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Get HTML content
    const html = await page.content()

    // Check if we got blocked
    if (html.includes('Just a moment') || html.includes('Checking your browser')) {
      console.log('✗ STILL BLOCKED - Cloudflare challenge detected\n')

      console.log('Waiting additional 15 seconds for challenge...')
      await new Promise(resolve => setTimeout(resolve, 15000))

      const html2 = await page.content()
      if (html2.includes('Just a moment')) {
        console.log('✗ Challenge not completed after 20s total')

        // Save HTML for debugging
        const fs = require('fs')
        fs.writeFileSync('blocked-page.html', html2)
        console.log('Saved blocked page HTML to blocked-page.html')
        return
      }
      console.log('✓ Challenge completed!\n')
    } else {
      console.log('✓ NO CLOUDFLARE CHALLENGE - page loaded directly!\n')
    }

    // Parse with cheerio
    const $ = cheerio.load(html)

    // Try to find player data
    const selectors = [
      '.player-ratings-table tbody tr',
      '.stats-table tbody tr',
      '.ranked-player',
      'table tbody tr'
    ]

    console.log('Parsing player data...')

    // Use the correct selector
    const playerRows = $('.stats-table.player-ratings-table tbody tr')
    console.log(`Found ${playerRows.length} player rows\n`)

    if (playerRows.length > 0) {
      console.log('✓✓✓ SUCCESS! Player ranking data retrieved!\n')

      console.log('Top 10 players:')
      playerRows.slice(0, 10).each((i, row) => {
        const playerName = $(row).find('.playerCol a').text().trim()
        const teamName = $(row).find('.teamCol').attr('data-sort') || ''
        const rating = $(row).find('.ratingCol').text().trim()
        const maps = $(row).find('.statsDetail').first().text().trim()

        console.log(`  ${i + 1}. ${playerName.padEnd(15)} | Team: ${teamName.padEnd(20)} | Maps: ${maps.padEnd(5)} | Rating: ${rating}`)
      })

      console.log(`\nTotal players in database: ${playerRows.length}`)
    } else {
      console.log('\n✗ No player data found')

      // Save HTML for analysis
      const fs = require('fs')
      fs.writeFileSync('real-browser-output.html', html)
      console.log('Saved HTML to real-browser-output.html for analysis')
    }

    // Take screenshot
    await page.screenshot({ path: 'real-browser-screenshot.png', fullPage: true })
    console.log('\n✓ Screenshot saved to real-browser-screenshot.png')

  } catch (error) {
    console.log(`✗ Error: ${error.message}`)
    console.error(error.stack)
  } finally {
    if (page) {
      console.log('\nClosing browser in 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    if (browser) {
      await browser.close()
    }
  }
}

testRealBrowser()
