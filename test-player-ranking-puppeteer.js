const { HLTV } = require('./lib/index')
const { createPuppeteerLoadPage, closePuppeteerBrowser } = require('./lib/puppeteer-loader')

async function testPlayerRanking() {
  console.log('Testing getPlayerRanking with Puppeteer bypass...\n')

  try {
    // Create HLTV instance with Puppeteer loadPage
    const hltvWithPuppeteer = HLTV.createInstance({
      loadPage: createPuppeteerLoadPage()
    })

    console.log('Fetching player rankings...')
    const start = Date.now()

    const players = await hltvWithPuppeteer.getPlayerRanking()

    const duration = Date.now() - start
    console.log(`✓ Success! Retrieved ${players.length} players in ${duration}ms\n`)

    if (players.length > 0) {
      console.log('Top 10 players:')
      players.slice(0, 10).forEach((p, i) => {
        const teamName = p.teams && p.teams.length > 0 ? p.teams[0].name : 'N/A'
        console.log(
          `  ${(i + 1).toString().padStart(2)}. ${(p.player?.name || 'Unknown').padEnd(15)} | ` +
          `Team: ${teamName.padEnd(20)} | ` +
          `Maps: ${p.maps.toString().padEnd(5)} | ` +
          `Rating: ${p.rating1}`
        )
      })
    }

    // Close browser
    await closePuppeteerBrowser()
    console.log('\n✓ Browser closed')

  } catch (error) {
    console.log(`✗ Error: ${error.message}`)
    console.error(error.stack)

    // Make sure to close browser on error
    await closePuppeteerBrowser()
  }
}

testPlayerRanking()
