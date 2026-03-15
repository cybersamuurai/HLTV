const { HLTV } = require('./lib/index.js')

async function quickTest() {
  console.log('Quick test of critical endpoints...\n')

  const tests = [
    { name: 'getMatches', fn: () => HLTV.getMatches() },
    { name: 'getTeamRanking', fn: () => HLTV.getTeamRanking() },
    { name: 'getEvents', fn: () => HLTV.getEvents() },
    { name: 'getNews', fn: () => HLTV.getNews() },
    { name: 'getRecentThreads', fn: () => HLTV.getRecentThreads() },
    { name: 'getStreams', fn: () => HLTV.getStreams() }
  ]

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`)
      const result = await test.fn()
      const count = Array.isArray(result) ? result.length : 'N/A'
      console.log(`  ✓ ${count} items\n`)
    } catch (error) {
      console.log(`  ✗ ${error.message}\n`)
    }
  }

  console.log('\nTesting potentially blocked endpoints (with timeout)...\n')

  const blockedTests = [
    { name: 'getResults', fn: () => HLTV.getResults() },
    { name: 'getPlayerRanking', fn: () => HLTV.getPlayerRanking() }
  ]

  for (const test of blockedTests) {
    try {
      console.log(`Testing ${test.name}...`)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout after 15s')), 15000)
      )
      const result = await Promise.race([test.fn(), timeoutPromise])
      const count = Array.isArray(result) ? result.length : 'N/A'
      console.log(`  ✓ ${count} items\n`)
    } catch (error) {
      console.log(`  ✗ ${error.message}\n`)
    }
  }
}

quickTest()
