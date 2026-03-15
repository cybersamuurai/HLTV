const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cheerio = require('cheerio')

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin())

async function testPuppeteerBypass() {
  console.log('Testing Puppeteer Cloudflare bypass on Player Ranking...\n')

  const url = 'https://www.hltv.org/stats/players'
  let browser

  try {
    console.log('Launching browser (visible window for better Cloudflare bypass)...')
    browser = await puppeteer.launch({
      headless: false, // Use visible browser window
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--flag-switches-begin',
        '--disable-site-isolation-trials',
        '--flag-switches-end'
      ]
    })

    const page = await browser.newPage()

    // Set realistic headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    })

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 })

    // Override navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      })
    })

    console.log('Navigating to player ranking page...')
    const startTime = Date.now()

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    const duration = Date.now() - startTime
    console.log(`✓ Page loaded in ${duration}ms\n`)

    // Get HTML content
    const html = await page.content()

    // Check if we got blocked
    if (html.includes('Just a moment') || html.includes('Checking your browser')) {
      console.log('✗ STILL BLOCKED BY CLOUDFLARE')
      console.log('Cloudflare challenge detected. Waiting for challenge to complete...\n')

      // Wait longer for challenge to complete
      await new Promise(resolve => setTimeout(resolve, 10000))

      // Reload page content
      const html2 = await page.content()

      if (html2.includes('Just a moment')) {
        console.log('✗ Challenge still not completed after 10s wait')

        // Try waiting even longer and look for navigation
        console.log('Waiting additional 10 seconds...')
        await new Promise(resolve => setTimeout(resolve, 10000))

        const html3 = await page.content()
        if (html3.includes('Just a moment')) {
          console.log('✗ Challenge failed after 20s total')
          return
        }
      }
      console.log('✓ Challenge completed!\n')
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

    console.log('Checking selectors:')
    for (const selector of selectors) {
      const count = $(selector).length
      console.log(`  ${selector}: ${count} elements`)

      if (count > 0 && count < 200) {
        console.log(`\n✓ SUCCESS! Found player data with selector: ${selector}`)
        console.log(`\nFirst element HTML (preview):`)
        console.log($(selector).first().html().substring(0, 400))
        break
      }
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'puppeteer-player-ranking.png' })
    console.log('\n✓ Screenshot saved to puppeteer-player-ranking.png')

  } catch (error) {
    console.log(`✗ Error: ${error.message}`)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

testPuppeteerBypass()
