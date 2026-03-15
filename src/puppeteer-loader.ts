import { connect } from 'puppeteer-real-browser'

let browserInstance: any = null
let isNavigating = false
let navigationQueue: Array<() => Promise<void>> = []

/**
 * Creates a loadPage function using puppeteer-real-browser to bypass Cloudflare
 * This is slower than got-scraping but can bypass Cloudflare protection
 */
export const createPuppeteerLoadPage = () => {
  return async (url: string): Promise<string> => {
    // Queue navigation requests to prevent conflicts
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          isNavigating = true

          // Launch browser if not already running
          if (!browserInstance) {
            console.log('[Puppeteer] Launching browser in headless mode (first request)...')
            const { browser, page } = await connect({
              headless: true, // Headless mode for MCP server
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080',
                '--disable-gpu'
              ],
              customConfig: {},
              turnstile: true, // Enable Cloudflare Turnstile solving
              connectOption: {},
              disableXvfb: false,
              ignoreAllFlags: false
            })

            browserInstance = browser
          }

          // Create a new page for each request to avoid navigation conflicts
          const page = await browserInstance.newPage()

          try {
            // Navigate to URL
            await page.goto(url, {
              waitUntil: 'networkidle2',
              timeout: 60000
            })

            // Wait a bit for any dynamic content
            await new Promise((res) => setTimeout(res, 2000))

            // Get HTML content
            const html = await page.content()

            // Check if still blocked (shouldn't happen with puppeteer-real-browser)
            if (
              html.includes('Just a moment') ||
              html.includes('Checking your browser')
            ) {
              console.warn('[Puppeteer] Cloudflare challenge detected, waiting...')
              await new Promise((res) => setTimeout(res, 10000))
              const html2 = await page.content()
              await page.close()
              resolve(html2)
              return
            }

            await page.close()
            resolve(html)
          } catch (error) {
            await page.close()
            throw error
          }
        } catch (error) {
          console.error('[Puppeteer] Error:', error)
          reject(error)
        } finally {
          isNavigating = false
          // Process next request in queue
          if (navigationQueue.length > 0) {
            const next = navigationQueue.shift()
            if (next) next()
          }
        }
      }

      // Add to queue if currently navigating
      if (isNavigating) {
        navigationQueue.push(executeRequest)
      } else {
        executeRequest()
      }
    })
  }
}

/**
 * Close the browser instance
 */
export const closePuppeteerBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
    isNavigating = false
    navigationQueue = []
  }
}
