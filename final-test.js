const { HLTV } = require('./lib/index.js')

async function finalTest() {
  console.log('='.repeat(70))
  console.log(' HLTV API - FINAL COMPREHENSIVE TEST')
  console.log('='.repeat(70))
  console.log('')

  const tests = [
    {
      name: 'getMatches',
      description: 'Get upcoming and live matches',
      fn: () => HLTV.getMatches(),
      validate: (result) => {
        if (!Array.isArray(result) || result.length === 0) return 'No matches found'
        const first = result[0]
        if (!first.id) return 'Missing match ID'
        return null // Success
      }
    },
    {
      name: 'getTeamRanking',
      description: 'Get current team rankings',
      fn: () => HLTV.getTeamRanking(),
      validate: (result) => {
        if (!Array.isArray(result) || result.length === 0) return 'No rankings found'
        if (!result[0].team?.name) return 'Missing team name'
        return null
      }
    },
    {
      name: 'getResults',
      description: 'Get recent match results',
      fn: () => HLTV.getResults(),
      validate: (result) => {
        if (!Array.isArray(result) || result.length === 0) return 'No results found'
        const first = result[0]
        if (!first.team1?.name || !first.team2?.name) return 'Missing team names'
        if (first.date === undefined) return 'Missing date'
        return null
      }
    },
    {
      name: 'getEvents',
      description: 'Get upcoming events',
      fn: () => HLTV.getEvents(),
      validate: (result) => {
        if (!Array.isArray(result) || result.length === 0) return 'No events found'
        if (!result[0].name) return 'Missing event name'
        return null
      }
    },
    {
      name: 'getPlayerRanking',
      description: 'Get player statistics rankings',
      fn: () => HLTV.getPlayerRanking(),
      validate: (result) => {
        if (!Array.isArray(result) || result.length === 0) return 'No players found'
        if (!result[0].player?.name) return 'Missing player name'
        return null
      }
    }
  ]

  let passed = 0
  let failed = 0
  const results = []

  for (const test of tests) {
    try {
      console.log(`\nTesting: ${test.name}`)
      console.log(`  ${test.description}`)
      console.log('  ' + '-'.repeat(65))

      const startTime = Date.now()
      const result = await test.fn()
      const duration = Date.now() - startTime

      const validation = test.validate(result)

      if (validation) {
        console.log(`  ✗ FAILED: ${validation}`)
        failed++
        results.push({ test: test.name, status: 'failed', error: validation, duration })
      } else {
        const count = Array.isArray(result) ? result.length : 'N/A'
        console.log(`  ✓ PASSED (${count} items, ${duration}ms)`)
        passed++
        results.push({ test: test.name, status: 'passed', count, duration })

        // Show sample data
        if (Array.isArray(result) && result.length > 0) {
          const sample = result[0]
          console.log(`  Sample:`, JSON.stringify(sample, null, 2).split('\n').slice(0, 5).join('\n  '))
        }
      }

    } catch (error) {
      console.log(`  ✗ FAILED: ${error.message}`)
      failed++
      results.push({ test: test.name, status: 'failed', error: error.message })
    }

    // Delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('')
  console.log('='.repeat(70))
  console.log(' FINAL RESULTS')
  console.log('='.repeat(70))
  console.log(`  Total tests: ${tests.length}`)
  console.log(`  ✓ Passed: ${passed}`)
  console.log(`  ✗ Failed: ${failed}`)
  console.log(`  Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`)
  console.log('='.repeat(70))

  if (passed === tests.length) {
    console.log('\n  🎉 ALL TESTS PASSED! The HLTV API is fully functional!')
  } else if (passed > 0) {
    console.log(`\n  ✓ ${passed} out of ${tests.length} methods are working`)
    console.log('  Some methods may require additional Cloudflare bypass improvements')
  } else {
    console.log('\n  ✗ No methods are working. Check Cloudflare protection.')
  }

  console.log('')

  return { passed, failed, results }
}

finalTest().then(result => {
  process.exit(result.failed > 0 ? 1 : 0)
})
