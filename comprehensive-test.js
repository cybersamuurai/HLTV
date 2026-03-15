const { HLTV } = require('./lib/index.js')

async function comprehensiveTest() {
  console.log('='.repeat(60))
  console.log('HLTV API Comprehensive Test')
  console.log('='.repeat(60))
  console.log('')

  const tests = [
    {
      name: 'getMatches',
      fn: () => HLTV.getMatches()
    },
    {
      name: 'getTeamRanking',
      fn: () => HLTV.getTeamRanking()
    },
    {
      name: 'getPlayerRanking',
      fn: () => HLTV.getPlayerRanking()
    },
    {
      name: 'getEvents',
      fn: () => HLTV.getEvents()
    },
    {
      name: 'getResults (last 5)',
      fn: () => HLTV.getResults()
    }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`\nTest: ${test.name}`)
      console.log('-'.repeat(40))

      const startTime = Date.now()
      const result = await test.fn()
      const duration = Date.now() - startTime

      if (Array.isArray(result)) {
        console.log(`✓ Success! Found ${result.length} items (${duration}ms)`)

        if (result.length > 0) {
          console.log(`  First item:`, JSON.stringify(result[0], null, 2).split('\n').slice(0, 10).join('\n'))
        } else {
          console.log(`  ⚠ Warning: Empty result (might be Cloudflare protection or no data)`)
        }
        passed++
      } else {
        console.log(`✓ Success! Got result (${duration}ms)`)
        console.log(`  Result type:`, typeof result)
        passed++
      }

    } catch (error) {
      console.log(`✗ Failed: ${error.message}`)
      if (error.stack) {
        console.log(`  Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
      }
      failed++
    }

    // Delay between requests to avoid Cloudflare throttling
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('')
  console.log('='.repeat(60))
  console.log(`Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`)
  console.log('='.repeat(60))

  if (passed > 0) {
    console.log('\n✓ HLTV API is working!')
    if (failed === 0) {
      console.log('  All methods are functional.')
    } else {
      console.log('  Some methods may be affected by Cloudflare or site changes.')
    }
  } else {
    console.log('\n✗ HLTV API is not working properly.')
    console.log('  This might be due to:')
    console.log('  - Cloudflare bot protection')
    console.log('  - Changes in HLTV website structure')
    console.log('  - Network connectivity issues')
  }
}

comprehensiveTest()
