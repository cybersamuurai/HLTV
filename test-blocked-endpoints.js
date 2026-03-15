const { HLTV } = require('./lib/index.js')

async function testBlockedEndpoints() {
  console.log('Testing potentially blocked endpoints...\n')

  // Test with simple call, no extra retries
  console.log('1. Testing getResults (first page only)...')
  try {
    const start = Date.now()
    const results = await HLTV.getResults()
    const duration = Date.now() - start
    console.log(`   ✓ SUCCESS! Got ${results.length} results in ${duration}ms`)
    if (results.length > 0) {
      console.log(`   Sample: ${results[0].team1.name} vs ${results[0].team2.name}`)
    }
  } catch (error) {
    console.log(`   ✗ FAILED: ${error.message}`)
  }

  console.log('\n2. Testing getPlayerRanking...')
  try {
    const start = Date.now()
    const ranking = await HLTV.getPlayerRanking()
    const duration = Date.now() - start
    console.log(`   ✓ SUCCESS! Got ${ranking.length} players in ${duration}ms`)
    if (ranking.length > 0) {
      console.log(`   Top player: ${ranking[0].player.name}`)
    }
  } catch (error) {
    console.log(`   ✗ FAILED: ${error.message}`)
  }

  // Try with date filters to limit results
  console.log('\n3. Testing getResults with date filter...')
  try {
    const start = Date.now()
    const results = await HLTV.getResults({
      startDate: '2026-03-10',
      endDate: '2026-03-15'
    })
    const duration = Date.now() - start
    console.log(`   ✓ SUCCESS! Got ${results.length} results in ${duration}ms`)
  } catch (error) {
    console.log(`   ✗ FAILED: ${error.message}`)
  }

  console.log('\n4. Testing getPlayerRanking with date filter...')
  try {
    const start = Date.now()
    const ranking = await HLTV.getPlayerRanking({
      startDate: '2026-01-01',
      endDate: '2026-03-15'
    })
    const duration = Date.now() - start
    console.log(`   ✓ SUCCESS! Got ${ranking.length} players in ${duration}ms`)
  } catch (error) {
    console.log(`   ✗ FAILED: ${error.message}`)
  }

  console.log('\nTest complete!')
}

testBlockedEndpoints()
