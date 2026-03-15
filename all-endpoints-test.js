const { HLTV } = require('./lib/index.js')

async function comprehensiveTest() {
  console.log('═'.repeat(80))
  console.log('  HLTV API - COMPREHENSIVE TEST OF ALL ENDPOINTS')
  console.log('═'.repeat(80))
  console.log('')

  const tests = [
    // === MATCHES ===
    {
      category: 'MATCHES',
      name: 'getMatches',
      description: 'Get all upcoming and live matches',
      fn: () => HLTV.getMatches(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].id
    },
    {
      category: 'MATCHES',
      name: 'getMatch',
      description: 'Get specific match details',
      fn: async () => {
        const matches = await HLTV.getMatches()
        if (matches.length > 0) {
          return await HLTV.getMatch({ id: matches[0].id })
        }
        throw new Error('No matches to test')
      },
      validate: (r) => r && r.id
    },

    // === RESULTS ===
    {
      category: 'RESULTS',
      name: 'getResults',
      description: 'Get recent match results',
      fn: () => HLTV.getResults(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].id
    },
    {
      category: 'RESULTS',
      name: 'getMatchStats',
      description: 'Get match statistics',
      fn: async () => {
        // Use a known match ID
        return await HLTV.getMatchStats({ id: 62979 })
      },
      validate: (r) => r && r.id
    },

    // === EVENTS ===
    {
      category: 'EVENTS',
      name: 'getEvents',
      description: 'Get upcoming events/tournaments',
      fn: () => HLTV.getEvents(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].name
    },
    {
      category: 'EVENTS',
      name: 'getEvent',
      description: 'Get specific event details',
      fn: async () => {
        const events = await HLTV.getEvents()
        if (events.length > 0) {
          return await HLTV.getEvent({ id: events[0].id })
        }
        throw new Error('No events to test')
      },
      validate: (r) => r && r.name
    },
    {
      category: 'EVENTS',
      name: 'getPastEvents',
      description: 'Get past events',
      fn: () => HLTV.getPastEvents({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }),
      validate: (r) => Array.isArray(r)
    },

    // === TEAMS ===
    {
      category: 'TEAMS',
      name: 'getTeamRanking',
      description: 'Get current team rankings',
      fn: () => HLTV.getTeamRanking(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].team
    },
    {
      category: 'TEAMS',
      name: 'getTeam',
      description: 'Get specific team details',
      fn: async () => {
        const ranking = await HLTV.getTeamRanking()
        if (ranking.length > 0) {
          return await HLTV.getTeam({ id: ranking[0].team.id })
        }
        throw new Error('No teams to test')
      },
      validate: (r) => r && r.name
    },
    {
      category: 'TEAMS',
      name: 'getTeamStats',
      description: 'Get team statistics',
      fn: async () => {
        const ranking = await HLTV.getTeamRanking()
        if (ranking.length > 0) {
          return await HLTV.getTeamStats({ id: ranking[0].team.id })
        }
        throw new Error('No teams to test')
      },
      validate: (r) => r && r.overview
    },

    // === PLAYERS ===
    {
      category: 'PLAYERS',
      name: 'getPlayerRanking',
      description: 'Get player statistics rankings',
      fn: () => HLTV.getPlayerRanking(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].player
    },
    {
      category: 'PLAYERS',
      name: 'getPlayer',
      description: 'Get specific player details',
      fn: () => HLTV.getPlayer({ id: 7998 }), // s1mple
      validate: (r) => r && r.name
    },
    {
      category: 'PLAYERS',
      name: 'getPlayerStats',
      description: 'Get player statistics',
      fn: () => HLTV.getPlayerStats({ id: 7998 }),
      validate: (r) => r && r.overview
    },

    // === NEWS & MISC ===
    {
      category: 'NEWS',
      name: 'getNews',
      description: 'Get recent news articles',
      fn: () => HLTV.getNews(),
      validate: (r) => Array.isArray(r) && r.length > 0
    },
    {
      category: 'NEWS',
      name: 'getRecentThreads',
      description: 'Get recent forum threads',
      fn: () => HLTV.getRecentThreads(),
      validate: (r) => Array.isArray(r) && r.length > 0
    },
    {
      category: 'MISC',
      name: 'getStreams',
      description: 'Get live streams',
      fn: () => HLTV.getStreams(),
      validate: (r) => Array.isArray(r)
    }
  ]

  const results = []
  let passed = 0
  let failed = 0
  let currentCategory = ''

  for (const test of tests) {
    // Print category header
    if (currentCategory !== test.category) {
      currentCategory = test.category
      console.log('\n' + '─'.repeat(80))
      console.log(`  ${currentCategory}`)
      console.log('─'.repeat(80))
    }

    try {
      console.log(`\n  Testing: ${test.name}`)
      console.log(`  ${test.description}`)

      const startTime = Date.now()
      const result = await test.fn()
      const duration = Date.now() - startTime

      const isValid = test.validate(result)

      if (!isValid) {
        console.log(`  ✗ FAILED: Validation failed`)
        failed++
        results.push({
          category: test.category,
          test: test.name,
          status: 'failed',
          error: 'Validation failed',
          duration
        })
      } else {
        const count = Array.isArray(result) ? result.length : 'N/A'
        console.log(`  ✓ PASSED (${count} items, ${duration}ms)`)
        passed++
        results.push({
          category: test.category,
          test: test.name,
          status: 'passed',
          count,
          duration
        })

        // Show sample data for arrays
        if (Array.isArray(result) && result.length > 0) {
          const sample = JSON.stringify(result[0], null, 2)
            .split('\n')
            .slice(0, 3)
            .join('\n    ')
          console.log(`    Sample: ${sample}`)
        }
      }

    } catch (error) {
      console.log(`  ✗ FAILED: ${error.message}`)
      failed++
      results.push({
        category: test.category,
        test: test.name,
        status: 'failed',
        error: error.message
      })
    }

    // Delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  // Print summary
  console.log('\n' + '═'.repeat(80))
  console.log('  FINAL RESULTS')
  console.log('═'.repeat(80))
  console.log(`  Total tests: ${tests.length}`)
  console.log(`  ✓ Passed: ${passed}`)
  console.log(`  ✗ Failed: ${failed}`)
  console.log(`  Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`)
  console.log('═'.repeat(80))

  // Group results by category
  const byCategory = {}
  results.forEach(r => {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { passed: 0, failed: 0 }
    }
    if (r.status === 'passed') {
      byCategory[r.category].passed++
    } else {
      byCategory[r.category].failed++
    }
  })

  console.log('\n  Results by category:')
  Object.entries(byCategory).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed
    const rate = ((stats.passed / total) * 100).toFixed(0)
    console.log(`    ${category}: ${stats.passed}/${total} (${rate}%)`)
  })

  console.log('\n  Failed tests:')
  const failedTests = results.filter(r => r.status === 'failed')
  if (failedTests.length === 0) {
    console.log('    None! 🎉')
  } else {
    failedTests.forEach(r => {
      console.log(`    - ${r.test}: ${r.error}`)
    })
  }

  console.log('\n' + '═'.repeat(80))

  if (passed === tests.length) {
    console.log('  🎉 ALL TESTS PASSED! The HLTV API is fully functional!')
  } else if (passed / tests.length >= 0.8) {
    console.log(`  ✓ Excellent! ${passed} out of ${tests.length} methods working (${((passed/tests.length)*100).toFixed(0)}%)`)
  } else if (passed > 0) {
    console.log(`  ⚠ ${passed} out of ${tests.length} methods working (${((passed/tests.length)*100).toFixed(0)}%)`)
    console.log('  Some methods may need additional improvements')
  } else {
    console.log('  ✗ No methods are working. Check configuration.')
  }

  console.log('═'.repeat(80))
  console.log('')

  return { passed, failed, results }
}

comprehensiveTest().then(result => {
  process.exit(result.failed > 0 ? 1 : 0)
})
