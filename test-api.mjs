import { gotScraping } from 'got-scraping'

async function testAPI() {
  try {
    console.log('Testing HLTV API connection...')

    const response = await gotScraping({
      url: 'https://www.hltv.org/matches',
      timeout: { request: 10000 }
    })

    if (response.statusCode === 200) {
      console.log('✓ API is accessible')
      console.log('Status:', response.statusCode)
      console.log('Body length:', response.body.length)

      // Check if we got HTML content
      if (response.body.includes('<html')) {
        console.log('✓ Received HTML content')
      } else {
        console.log('✗ Unexpected content type')
      }

      // Check for Cloudflare protection
      if (response.body.includes('cloudflare') || response.body.includes('Cloudflare')) {
        console.log('⚠ Warning: Cloudflare protection detected')
      }

      return true
    } else {
      console.log('✗ Unexpected status code:', response.statusCode)
      return false
    }
  } catch (error) {
    console.error('✗ Error accessing API:', error.message)
    if (error.response) {
      console.error('Status:', error.response.statusCode)
    }
    return false
  }
}

testAPI()
