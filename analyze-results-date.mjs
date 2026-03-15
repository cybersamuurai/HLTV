import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-results.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Analyzing results page structure...\n')

const results = $('.result-con')
console.log(`Found ${results.length} results\n`)

// Analyze first few results
results.slice(0, 3).each((i, result) => {
  const $result = $(result)

  console.log('='.repeat(60))
  console.log(`RESULT ${i + 1}`)
  console.log('='.repeat(60))

  console.log('\nAll attributes:')
  Object.keys(result.attribs).forEach(attr => {
    console.log(`  ${attr}: ${result.attribs[attr]}`)
  })

  console.log('\nHTML (first 1500 chars):')
  console.log($result.html().substring(0, 1500))

  console.log('\n\nLooking for date/time elements:')
  $result.find('*').each((j, el) => {
    const $el = $(el)
    const text = $el.text().trim()
    const className = $el.attr('class') || ''

    if (className.includes('date') || className.includes('time') ||
        text.match(/\d{1,2}:\d{2}/) ||
        Object.keys(el.attribs).some(attr => attr.includes('unix') || attr.includes('date') || attr.includes('time'))) {
      console.log(`  ${el.name}.${className}:`)
      console.log(`    Text: "${text.substring(0, 50)}"`)
      Object.keys(el.attribs).forEach(attr => {
        if (attr.startsWith('data-')) {
          console.log(`    ${attr}: ${el.attribs[attr]}`)
        }
      })
    }
  })

  console.log('\n')
})

// Check for any grouped structure
console.log('\n\nChecking for date grouping structure...')
$('[class*="group"], [class*="date"]').each((i, el) => {
  const $el = $(el)
  if (i < 5) {
    console.log(`${el.name}.${$el.attr('class')}:`)
    console.log(`  Text: "${$el.text().substring(0, 100)}"`)
    Object.keys(el.attribs).forEach(attr => {
      if (attr.startsWith('data-')) {
        console.log(`  ${attr}: ${el.attribs[attr]}`)
      }
    })
  }
})
