import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-results.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Checking results page grouping structure...\n')

// Look for parent elements that contain results
console.log('Looking for containers that hold result-con elements...')

const containers = $('.result-con').parent()
console.log(`\nParent of .result-con: ${containers.first().get(0)?.name}.${containers.first().attr('class')}`)

// Look for date headers or groupings
console.log('\n\nLooking for date headers/groups...')
$('[class*="date"], h2, h3, .results-holder, .results-sublist').each((i, el) => {
  const $el = $(el)
  if (i < 10) {
    const text = $el.text().trim()
    if (text.length > 0 && text.length < 200) {
      console.log(`${el.name}.${$el.attr('class') || '(no class)'}:`)
      console.log(`  Text: "${text.substring(0, 100)}"`)
      console.log(`  Children: ${$el.children().length}`)

      // Check if it contains result-con elements
      const resultCons = $el.find('.result-con').length
      if (resultCons > 0) {
        console.log(`  Contains ${resultCons} .result-con elements`)
      }
    }
  }
})

// Look at the overall structure
console.log('\n\nOverall results container structure:')
const resultsContainer = $('.results, .results-all, .results-holder, main').filter((i, el) => {
  return $(el).find('.result-con').length > 0
}).first()

if (resultsContainer.length > 0) {
  console.log(`Container: ${resultsContainer.get(0).name}.${resultsContainer.attr('class')}`)
  console.log(`\nDirect children (first 20):`)
  resultsContainer.children().slice(0, 20).each((i, child) => {
    const $child = $(child)
    const resultConCount = $child.find('.result-con').length
    console.log(`  ${i}. ${child.name}.${$child.attr('class') || '(no class)'} - ${resultConCount} results`)

    // If this is a grouping element, show more details
    if (resultConCount > 0 && !$child.hasClass('result-con')) {
      console.log(`     Text preview: "${$child.text().trim().substring(0, 50)}"`)
      Object.keys(child.attribs).forEach(attr => {
        if (attr.startsWith('data-')) {
          console.log(`     ${attr}: ${child.attribs[attr]}`)
        }
      })
    }
  })
}
