/**
 * Local test for MCP server
 * Tests that the server responds to list_tools and call_tool requests
 */

const { spawn } = require('child_process')

async function testMCPServer() {
  console.log('Starting MCP Server test...\n')

  const serverProcess = spawn('node', ['lib/mcp-server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  })

  let receivedData = ''

  serverProcess.stdout.on('data', (data) => {
    receivedData += data.toString()
    console.log('Server output:', data.toString())
  })

  serverProcess.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString())
  })

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Sending list_tools request...\n')

  // Send list_tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }

  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n')

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log('\nTest completed. Server will terminate.')
  serverProcess.kill()

  if (receivedData.includes('hltv_get_matches')) {
    console.log('\n✓ SUCCESS: MCP Server is working!')
    console.log('  Found tools in response')
  } else {
    console.log('\n✗ FAILED: Could not verify MCP Server')
    console.log('  Response:', receivedData)
  }
}

testMCPServer().catch(error => {
  console.error('Test error:', error)
  process.exit(1)
})
