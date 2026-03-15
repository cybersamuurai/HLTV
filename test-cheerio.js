const cheerio = require('cheerio');

console.log('Testing cheerio exports...\n');

// Check what's available
console.log('typeof cheerio:', typeof cheerio);
console.log('typeof cheerio.default:', typeof cheerio.default);
console.log('cheerio.load exists:', typeof cheerio.load);

// Try to load HTML
const $ = cheerio.load('<div><span class="test">Hello</span></div>');
const span = $('span');

console.log('\nTesting element access...');
console.log('span.length:', span.length);
console.log('span.text():', span.text());

// Get raw element
const elements = span.toArray();
console.log('\nElements array:', elements.length);

// Try to wrap element
if (elements.length > 0) {
  const rawEl = elements[0];
  console.log('Raw element:', rawEl);

  // Try different ways to wrap
  console.log('\nTrying to wrap element...');

  try {
    const wrapped1 = cheerio.default ? cheerio.default(rawEl) : null;
    console.log('cheerio.default(el):', wrapped1 ? 'works' : 'cheerio.default is undefined');
  } catch (e) {
    console.log('cheerio.default(el): error -', e.message);
  }

  try {
    const wrapped2 = $(rawEl);
    console.log('$(el):', wrapped2.length > 0 ? 'works' : 'failed');
  } catch (e) {
    console.log('$(el): error -', e.message);
  }

  try {
    const wrapped3 = cheerio.load(rawEl);
    console.log('cheerio.load(el):', typeof wrapped3);
  } catch (e) {
    console.log('cheerio.load(el): error -', e.message);
  }
}
