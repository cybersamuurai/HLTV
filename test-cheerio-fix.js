const cheerio = require('cheerio');

console.log('Testing cheerio element wrapping fix...\n');

const html = '<div><span class="item">Item 1</span><span class="item">Item 2</span></div>';
const $ = cheerio.load(html);

// Get all items
const items = $('.item');
console.log('Found items:', items.length);

// Convert to array
const elements = items.toArray();
console.log('Elements array length:', elements.length);

// Try wrapping each element using $ function
console.log('\nWrapping elements using $():');
elements.forEach((el, i) => {
  const wrapped = $(el);
  console.log(`  Item ${i}: text="${wrapped.text()}", length=${wrapped.length}`);
});

// This is what we need to fix in scraper.ts
console.log('\nThis should replace cheerio.default:');
console.log('  OLD: root.toArray().map(cheerio.default).map(attachMethods)');
console.log('  NEW: root.toArray().map(el => $(el)).map(attachMethods)');
console.log('  But $ needs to be passed as parameter!');
