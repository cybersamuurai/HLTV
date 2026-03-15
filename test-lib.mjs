import { HLTV } from './lib/index.js'

async function testHLTVLibrary() {
  console.log('Testing HLTV library methods...\n')

  try {
    // Test 1: Get matches
    console.log('1. Testing getMatches()...')
    const matches = await HLTV.getMatches()
    console.log(`✓ getMatches() works - found ${matches.length} matches`)
    if (matches.length > 0) {
      console.log(`  First match: ${matches[0].team1?.name || 'TBD'} vs ${matches[0].team2?.name || 'TBD'}`)
    }
    console.log('')

    // Test 2: Get team ranking
    console.log('2. Testing getTeamRanking()...')
    const ranking = await HLTV.getTeamRanking()
    console.log(`✓ getTeamRanking() works - found ${ranking.length} teams`)
    if (ranking.length > 0) {
      console.log(`  #1 team: ${ranking[0].team.name}`)
    }
    console.log('')

    console.log('✓ All tests passed! The HLTV API is working.')
    return true
  } catch (error) {
    console.error('✗ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'))
    }
    return false
  }
}

testHLTVLibrary()
