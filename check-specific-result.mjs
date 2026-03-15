import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-results.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Checking .result-con elements for data-zonedgrouping-entry-unix...\n')

const resultCons = $('.result-con')
console.log(`Total .result-con elements: ${resultCons.length}`)

let withDate = 0
let withoutDate = 0

resultCons.each((i, el) => {
  const $el = $(el)
  const unix = $el.attr('data-zonedgrouping-entry-unix')

  if (unix) {
    withDate++
    if (i < 5) {
      console.log(`\nResult ${i + 1} HAS date:`)
      console.log(`  data-zonedgrouping-entry-unix: ${unix}`)
      console.log(`  Date: ${new Date(parseInt(unix)).toLocaleString()}`)
    }
  } else {
    withoutDate++
    if (withoutDate <= 3) {
      console.log(`\nResult without date (index ${i}):`)
      console.log(`  Class: ${$el.attr('class')}`)
      console.log(`  Parent: ${$el.parent().get(0)?.name}.${$el.parent().attr('class')}`)
    }
  }
})

console.log(`\n\nSummary:`)
console.log(`  With date: ${withDate}`)
console.log(`  Without date: ${withoutDate}`)
