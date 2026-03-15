const { HLTV } = require('./lib/index.js')

async function testMatches() {
  console.log('Testing getMatches() with new structure...\n')

  try {
    const matches = await HLTV.getMatches()
    console.log(`✓ Success! Found ${matches.length} matches\n`)

    if (matches.length > 0) {
      console.log('First 5 matches:')
      matches.slice(0, 5).forEach((match, i) => {
        console.log(`\n${i + 1}. Match ID: ${match.id}`)
        console.log(`   Teams: ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}`)
        console.log(`   Event: ${match.event?.name || 'Unknown'}`)
        console.log(`   Stars: ${'⭐'.repeat(match.stars)}`)
        console.log(`   Format: ${match.format || 'N/A'}`)
        console.log(`   Live: ${match.live ? 'YES' : 'NO'}`)
        console.log(`   Date: ${match.date ? new Date(match.date).toLocaleString() : 'TBD'}`)
      })
    }

    return true
  } catch (error) {
    console.error('✗ Error:', error.message)
    console.error('Stack:', error.stack)
    return false
  }
}

testMatches()
