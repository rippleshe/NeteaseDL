
import { NeteaseProvider } from '../server/services/netease';

async function test() {
  const provider = new NeteaseProvider();
  
  console.log('--- Testing User Provided Links (Parse & Download) ---');

  const links = [
    { name: 'User Profile', url: 'https://music.163.com/#/user/home?id=29879272' },
    { name: 'Standard Song', url: 'https://music.163.com/#/song?id=28754101' },
    { name: 'VIP/Copyright Song', url: 'https://music.163.com/#/song?id=3348241423' }
  ];

  for (const link of links) {
    console.log(`\nTesting: ${link.name}`);
    console.log(`URL: ${link.url}`);
    try {
      // 1. Parse Metadata
      const parseResult = await provider.parse(link.url);
      console.log('✅ Parse Success!');
      console.log(`   Title: ${parseResult.title}`);
      console.log(`   ID: ${parseResult.id}`);

      // 2. Get Download URL
      console.log('   Attempting to get download URL...');
      const downloadResult = await provider.getDownloadUrl(parseResult.id, 'standard');
      
      if (downloadResult.playable === false) {
        console.log(`   ⚠️  Download Restricted (Expected): ${downloadResult.reason}`);
      } else {
        console.log(`   ✅ Download URL: ${downloadResult.url ? 'Available' : 'Missing'}`);
      }

    } catch (e: any) {
      console.log('❌ Failed');
      console.log(`   Error: ${e.message}`);
    }
  }
  
  console.log('\n--- Test Complete ---');
}

test().catch(console.error);
