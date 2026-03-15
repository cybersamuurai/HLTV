import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

function deepAnalyzeMatches() {
  console.log('DEEP ANALYSIS: Matches Page')
  console.log('='.repeat(60))

  const html = readFileSync('debug-matches.html', 'utf-8')
  const $ = cheerio.load(html)

  // Find script tags that might contain match data
  console.log('\nLooking for JSON data in scripts...')
  $('script').each((i, el) => {
    const text = $(el).html() || ''
    if (text.includes('matches') && text.includes('{')) {
      console.log(`\nScript ${i} (first 500 chars):`)
      console.log(text.substring(0, 500))
    }
  })

  // Look for any elements with data attributes
  console.log('\nLooking for elements with data-* attributes...')
  const dataElements = $('[data-match-id], [data-event-id], [id*="match"]')
  console.log(`Found ${dataElements.length} elements with match-related data attributes`)

  if (dataElements.length > 0) {
    console.log('\nFirst 5 elements:')
    dataElements.slice(0, 5).each((i, el) => {
      const $el = $(el)
      console.log(`\n  Element ${i}:`)
      console.log(`    Tag: ${el.name}`)
      console.log(`    Class: ${$el.attr('class')}`)
      console.log(`    ID: ${$el.attr('id')}`)
      Object.keys(el.attribs).forEach(attr => {
        if (attr.startsWith('data-')) {
          console.log(`    ${attr}: ${el.attribs[attr]}`)
        }
      })
    })
  }
}

function deepAnalyzeResults() {
  console.log('\n\nDEEP ANALYSIS: Results Page')
  console.log('='.repeat(60))

  const html = readFileSync('debug-results.html', 'utf-8')
  const $ = cheerio.load(html)

  const results = $('.result-con')
  console.log(`\nFound ${results.length} .result-con elements`)

  if (results.length > 0) {
    const first = results.first()
    console.log('\nFirst result detailed structure:')
    console.log('  All attributes:')
    Object.keys(first.get(0).attribs).forEach(attr => {
      console.log(`    ${attr}: ${first.attr(attr)}`)
    })

    console.log('\n  Child structure:')
    first.children().each((i, child) => {
      const $child = $(child)
      console.log(`    Child ${i}: ${child.name} - class: ${$child.attr('class')}`)
    })

    console.log('\n  Looking for date/time elements:')
    first.find('[data-unix], .time, .date, [class*="time"], [class*="date"]').each((i, el) => {
      const $el = $(el)
      console.log(`    ${el.name}.${$el.attr('class')}: text="${$el.text()}"`)
      Object.keys(el.attribs).forEach(attr => {
        if (attr.startsWith('data-')) {
          console.log(`      ${attr}: ${el.attribs[attr]}`)
        }
      })
    })

    console.log('\n  First result HTML (first 1000 chars):')
    console.log(first.html().substring(0, 1000))
  }
}

deepAnalyzeMatches()
deepAnalyzeResults()
