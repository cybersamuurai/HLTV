import { gotScraping } from 'got-scraping'
import { loadSavedCookies } from './login'

/**
 * Creates a loadPage function that uses saved authentication cookies
 */
export function createAuthenticatedLoadPage() {
  let cookies: any[] | null = null

  return async (url: string): Promise<string> => {
    // Load cookies once
    if (!cookies) {
      cookies = await loadSavedCookies()
    }

    // Convert cookies to Cookie header format
    const cookieHeader = cookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const response = await gotScraping({
      url,
      headers: {
        'Cookie': cookieHeader,
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'cache-control': 'max-age=0',
        'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      headerGeneratorOptions: {
        browsers: [
          { name: 'chrome', minVersion: 120, maxVersion: 122 },
          { name: 'firefox', minVersion: 120, maxVersion: 123 }
        ],
        httpVersion: '2'
      },
      timeout: { request: 60000 },
      retry: { limit: 3, statusCodes: [403, 408, 429, 500, 502, 503] },
      http2: true,
      followRedirect: true
    })

    return response.body
  }
}

/**
 * Makes authenticated POST request to HLTV API
 */
export async function authenticatedPost(
  url: string,
  data: any
): Promise<any> {
  const cookies = await loadSavedCookies()

  const cookieHeader = cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  const response = await gotScraping({
    url,
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/json',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'origin': 'https://www.hltv.org',
      'referer': 'https://www.hltv.org/fantasy',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    json: data,
    timeout: { request: 30000 },
    retry: { limit: 2 },
    http2: true
  })

  return JSON.parse(response.body)
}
