const { HLTV } = require('./lib/index')
const { createPuppeteerLoadPage, closePuppeteerBrowser } = require('./lib/puppeteer-loader')

async function testBlockedEndpoints() {
  console.log('═'.repeat(80))
  console.log('  TESTING PREVIOUSLY BLOCKED ENDPOINTS WITH PUPPETEER')
  console.log('═'.repeat(80))
  console.log('')

  // Create HLTV instance with Puppeteer
  const hltvPuppeteer = HLTV.createInstance({
    loadPage: createPuppeteerLoadPage()
  })

  const tests = [
    {
      name: 'getPlayerRanking',
      description: 'Get player statistics rankings',
      fn: () => hltvPuppeteer.getPlayerRanking(),
      validate: (r) => Array.isArray(r) && r.length > 0 && r[0].player
    },
    {
      name: 'getPlayerStats',
      description: 'Get player statistics',
      fn: () => hltvPuppeteer.getPlayerStats({ id: 7998 }), // s1mple
      validate: (r) => r && r.overview
    },
    {
      name: 'getMatchStats',
      description: 'Get match statistics',
      fn: () => hltvPuppeteer.getMatchStats({ id: 62979 }),
      validate: (r) => r && r.id
    },
    {
      name: 'getTeamStats',
      description: 'Get team statistics',
      fn: async () => {
        const ranking = await hltvPuppeteer.getTeamRanking()
        if (ranking.length > 0) {
          return await hltvPuppeteer.getTeamStats({ id: ranking[0].team.id })
        }
        throw new Error('No teams to test')
      },
      validate: (r) => r && r.overview
    }
  ]

  const results = []
  let passed = 0
  let failed = 0

  for (const test of tests) {
    console.log(`Testing: ${test.name}`)
    console.log(`  ${test.description}`)

    try {
      const start = Date.now()
      const result = await test.fn()
      const duration = Date.now() - start

      if (test.validate(result)) {
        console.log(`  ✓ PASSED (${duration}ms)`)
        passed++
        results.push({ name: test.name, status: 'PASSED', duration })
      } else {
        console.log(`  ✗ FAILED: Validation failed`)
        failed++
        results.push({ name: test.name, status: 'FAILED', error: 'Validation failed' })
      }
    } catch (error) {
      console.log(`  ✗ FAILED: ${error.message}`)
      failed++
      results.push({ name: test.name, status: 'FAILED', error: error.message })
    }

    console.log('')
  }

  // Close browser
  await closePuppeteerBrowser()

  console.log('═'.repeat(80))
  console.log('  FINAL RESULTS')
  console.log('═'.repeat(80))
  console.log(`  Total tests: ${tests.length}`)
  console.log(`  ✓ Passed: ${passed}`)
  console.log(`  ✗ Failed: ${failed}`)
  console.log(`  Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`)
  console.log('═'.repeat(80))

  if (failed > 0) {
    console.log('\n  Failed tests:')
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`    - ${r.name}: ${r.error}`)
    })
    console.log('')
  }

  console.log('\n  ✓ All previously blocked endpoints have been tested with Puppeteer bypass')
  console.log('')
}

testBlockedEndpoints()
