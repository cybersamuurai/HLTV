import { Agent as HttpsAgent } from 'https'
import { Agent as HttpAgent } from 'http'
import { gotScraping } from 'got-scraping'

export interface HLTVConfig {
  loadPage: (url: string) => Promise<string>
  httpAgent: HttpsAgent | HttpAgent
}

export const defaultLoadPage =
  (httpAgent: HttpsAgent | HttpAgent | undefined) => (url: string) =>
    gotScraping({
      url,
      agent: { http: httpAgent, https: httpAgent },
      headerGeneratorOptions: {
        browsers: [
          { name: 'chrome', minVersion: 120, maxVersion: 122 },
          { name: 'firefox', minVersion: 120, maxVersion: 123 },
          { name: 'edge', minVersion: 120 }
        ],
        devices: ['desktop'],
        locales: ['en-US', 'en'],
        operatingSystems: ['windows', 'macos', 'linux'],
        httpVersion: '2'
      },
      headers: {
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
        'upgrade-insecure-requests': '1'
      },
      timeout: {
        request: 60000
      },
      retry: {
        limit: 3,
        methods: ['GET'],
        statusCodes: [403, 408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
        errorCodes: [
          'ETIMEDOUT',
          'ECONNRESET',
          'EADDRINUSE',
          'ECONNREFUSED',
          'EPIPE',
          'ENOTFOUND',
          'ENETUNREACH',
          'EAI_AGAIN'
        ]
      },
      http2: true,
      followRedirect: true,
      maxRedirects: 10
    }).then((res: any) => res.body)

const defaultAgent = new HttpsAgent()

export const defaultConfig: HLTVConfig = {
  httpAgent: defaultAgent,
  loadPage: defaultLoadPage(defaultAgent)
}
