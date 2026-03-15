import { readFileSync } from 'fs'
import * as cheerio from 'cheerio'

const html = readFileSync('debug-results.html', 'utf-8')
const $ = cheerio.load(html)

console.log('Analyzing .results-holder structure...\n')

const holder = $('.results-holder.allres').first()

console.log('HTML structure (first 2000 chars):')
console.log(holder.html().substring(0, 2000))

console.log('\n\nDirect children:')
holder.children().each((i, child) => {
  const $child = $(child)
  const resultCons = $child.find('.result-con').length

  console.log(`\n${i}. ${child.name}.${$child.attr('class') || '(no class)'}`)
  console.log(`   Results: ${resultCons}`)
  console.log(`   Text preview: "${$child.text().trim().substring(0, 80)}"`)

  // Check for data attributes
  Object.keys(child.attribs).forEach(attr => {
    if (attr.startsWith('data-')) {
      console.log(`   ${attr}: ${child.attribs[attr]}`)
    }
  })

  // If this contains results, show child structure
  if (resultCons > 0 && i < 3) {
    console.log('   Child structure:')
    $child.children().slice(0, 5).each((j, gchild) => {
      const $gchild = $(gchild)
      console.log(`     ${gchild.name}.${$gchild.attr('class') || '(no class)'} - ${$gchild.find('.result-con').length} results`)
    })
  }
})
