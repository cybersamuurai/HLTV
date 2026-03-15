const { HLTV } = require('./lib/index.js')

async function quickTest() {
  console.log('Testing HLTV library...\n')

  try {
    console.log('Test 1: getMatches()')
    const matches = await HLTV.getMatches()
    console.log(`✓ Success! Found ${matches.length} matches`)

    if (matches.length > 0) {
      const match = matches[0]
      console.log(`\nFirst match example:`)
      console.log(`  Team 1: ${match.team1?.name || 'TBD'}`)
      console.log(`  Team 2: ${match.team2?.name || 'TBD'}`)
      console.log(`  Format: ${match.format || 'unknown'}`)
      console.log(`  Date: ${match.date || 'TBD'}`)
    }

    return true
  } catch (error) {
    console.error('\n✗ Error:', error.message)
    console.error('\nStack trace:')
    console.error(error.stack)
    return false
  }
}

quickTest()
