import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import fs from 'fs/promises'
import path from 'path'

puppeteer.use(StealthPlugin())

const COOKIES_FILE = path.join(__dirname, '../../.hltv-cookies.json')
const LOGIN_URL = 'https://www.hltv.org/login'

interface LoginCredentials {
  username: string
  password: string
}

/**
 * Opens browser for manual login and saves cookies
 * User needs to complete captcha manually
 */
export async function loginAndSaveCookies(
  credentials: LoginCredentials
): Promise<void> {
  console.log('Opening browser for login...')
  console.log('You will need to complete the captcha manually')

  const browser = await puppeteer.launch({
    headless: false, // Must be visible for captcha
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  })

  const page = await browser.newPage()

  try {
    // Navigate to login page
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' })

    // Fill in credentials
    await page.waitForSelector('input[name="username"]', { timeout: 10000 })
    await page.type('input[name="username"]', credentials.username)
    await page.type('input[name="password"]', credentials.password)

    console.log('\n===========================================')
    console.log('PLEASE COMPLETE THE CAPTCHA MANUALLY')
    console.log('Then click the login button')
    console.log('The browser will close automatically after successful login')
    console.log('===========================================\n')

    // Wait for navigation after login (indicates success)
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: 300000 // 5 minutes for user to complete captcha
    })

    // Save cookies
    const cookies = await page.cookies()
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2))

    console.log(`\n✓ Login successful! Cookies saved to ${COOKIES_FILE}`)
    console.log(`Total cookies saved: ${cookies.length}`)

    // Verify we're logged in
    const isLoggedIn = await page.evaluate(() => {
      // Check for logout link or user menu
      return document.querySelector('.logged-in-username') !== null
    })

    if (isLoggedIn) {
      console.log('✓ Verified: User is logged in')
    } else {
      console.log('⚠ Warning: Could not verify login status')
    }
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

/**
 * Load saved cookies from file
 */
export async function loadSavedCookies(): Promise<any[]> {
  try {
    const cookiesString = await fs.readFile(COOKIES_FILE, 'utf-8')
    const cookies = JSON.parse(cookiesString)
    console.log(`Loaded ${cookies.length} cookies from ${COOKIES_FILE}`)
    return cookies
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(
        'No saved cookies found. Please run login first.'
      )
    }
    throw error
  }
}

/**
 * Check if we have saved cookies
 */
export async function hasSavedCookies(): Promise<boolean> {
  try {
    await fs.access(COOKIES_FILE)
    return true
  } catch {
    return false
  }
}

/**
 * Delete saved cookies
 */
export async function clearSavedCookies(): Promise<void> {
  try {
    await fs.unlink(COOKIES_FILE)
    console.log('Cookies cleared')
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw error
    }
  }
}
