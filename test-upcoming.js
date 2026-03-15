const { HLTV } = require('./lib/index.js')

async function testUpcoming() {
  console.log('Testing upcoming matches...\n')

  try {
    const matches = await HLTV.getMatches()

    // Filter to find upcoming (non-live) matches
    const upcoming = matches.filter(m => !m.live)

    console.log(`✓ Found ${upcoming.length} upcoming matches\n`)

    if (upcoming.length > 0) {
      console.log('First 10 upcoming matches:')
      upcoming.slice(0, 10).forEach((match, i) => {
        console.log(`\n${i + 1}. Match ID: ${match.id}`)
        console.log(`   Teams: ${match.team1?.name || 'TBD'} vs ${match.team2?.name || match.title || 'TBD'}`)
        console.log(`   Event: ${match.event?.name || 'Unknown'}`)
        console.log(`   Stars: ${'⭐'.repeat(match.stars)}${match.stars === 0 ? '(none)' : ''}`)
        console.log(`   Format: ${match.format || 'N/A'}`)
        console.log(`   Date: ${match.date ? new Date(match.date).toLocaleString() : 'TBD'}`)
      })
    }

    return true
  } catch (error) {
    console.error('✗ Error:', error.message)
    return false
  }
}

testUpcoming()
