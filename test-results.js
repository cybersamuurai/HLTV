const { HLTV } = require('./lib/index.js')

async function testResults() {
  console.log('Testing getResults()...\n')

  try {
    const results = await HLTV.getResults()
    console.log(`✓ Success! Found ${results.length} results\n`)

    if (results.length > 0) {
      console.log('First 5 results:')
      results.slice(0, 5).forEach((result, i) => {
        console.log(`\n${i + 1}. Match ID: ${result.id}`)
        console.log(`   Teams: ${result.team1.name} vs ${result.team2.name}`)
        console.log(`   Score: ${result.result.team1} - ${result.result.team2}`)
        console.log(`   Stars: ${'⭐'.repeat(result.stars)}${result.stars === 0 ? '(none)' : ''}`)
        console.log(`   Format: ${result.format}`)
        console.log(`   Map: ${result.map || 'N/A'}`)
        console.log(`   Date: ${new Date(result.date).toLocaleString()}`)
      })
    }

    return true
  } catch (error) {
    console.error('✗ Error:', error.message)
    console.error('Stack:', error.stack.split('\n').slice(0, 10).join('\n'))
    return false
  }
}

testResults()
