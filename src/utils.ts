import * as cheerio from 'cheerio'
import { randomUUID } from 'crypto'

export const fetchPage = async (
  url: string,
  loadPage: (url: string) => Promise<string>,
  retries: number = 1
): Promise<cheerio.Root> => {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add minimal delay before retry attempts
      if (attempt > 0) {
        const delay = 500 + Math.random() * 500 // 500-1000ms for retries
        await sleep(delay)
      }

      const root = cheerio.load(await loadPage(url))
      const html = root.html()

      if (
        html.includes('error code:') ||
        html.includes('Sorry, you have been blocked') ||
        html.includes('Checking your browser before accessing') ||
        html.includes('Enable JavaScript and cookies to continue')
      ) {
        const error = new Error(
          'Access denied | www.hltv.org used Cloudflare to restrict access'
        )
        lastError = error

        // If Cloudflare blocked us and we have retries left, try again
        if (attempt < retries) {
          continue
        }

        throw error
      }

      // Success - add tiny delay before returning to avoid rate limiting
      await sleep(100 + Math.random() * 100) // 100-200ms
      return root

    } catch (error) {
      lastError = error as Error

      // If it's the last attempt, throw the error
      if (attempt >= retries) {
        throw error
      }

      // Otherwise, continue to next retry
    }
  }

  throw lastError || new Error('Failed to fetch page')
}

export const generateRandomSuffix = () => {
  return randomUUID()
}

export const percentageToDecimalOdd = (odd: number): number =>
  parseFloat(((1 / odd) * 100).toFixed(2))

export function getIdAt(index: number, href: string): number | undefined
export function getIdAt(index: number): (href: string) => number | undefined
export function getIdAt(index?: number, href?: string): any {
  switch (arguments.length) {
    case 1:
      return (href: string) => getIdAt(index!, href)
    default:
      return parseNumber(href!.split('/')[index!])
  }
}

export const notNull = <T>(x: T | null): x is T => x !== null

export const parseNumber = (str: string | undefined): number | undefined => {
  if (!str) {
    return undefined
  }

  const num = Number(str)

  return Number.isNaN(num) ? undefined : num
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
