
import { NeteaseProvider } from '../server/services/netease';

async function test() {
  const provider = new NeteaseProvider();
  const p = provider as any; // Access private methods

  console.log('--- Testing URL Extraction (Integration) ---');
  const text1 = 'Listen to this: https://music.163.com/song?id=123';
  const extracted1 = p.extractUrlFromText(text1);
  console.log(`Input: "${text1}" -> Extracted: ${extracted1}`);
  if (extracted1 !== 'https://music.163.com/song?id=123') console.error('FAIL');

  const text2 = 'No url here';
  const extracted2 = p.extractUrlFromText(text2);
  console.log(`Input: "${text2}" -> Extracted: ${extracted2}`);
  if (extracted2 !== null) console.error('FAIL');

  console.log('\n--- Testing ID Extraction (Integration) ---');
  const urls = [
    { url: 'https://music.163.com/song?id=123456', expected: '123456' },
    { url: 'https://music.163.com/song/654321', expected: '654321' },
    { url: 'http://music.163.com/song/123456?userid=999', expected: '123456' },
    { url: 'https://music.163.com/song?userid=888&id=987654', expected: '987654' },
    { url: 'https://y.music.163.com/m/song/777777', expected: '777777' }
  ];

  for (const item of urls) {
    const id = p.extractId(item.url);
    console.log(`URL: ${item.url} -> ID: ${id}`);
    if (id !== item.expected) console.error(`FAIL: Expected ${item.expected}, got ${id}`);
  }

  console.log('\n--- Testing Short Link Logic (Mock Check) ---');
  // We won't make real network calls here to avoid blocking, but we check if the function exists
  if (typeof p.resolveShortLink !== 'function') {
    console.error('FAIL: resolveShortLink method missing');
  } else {
    console.log('resolveShortLink method exists.');
  }

  console.log('\n--- Integration Test Complete ---');
}

test().catch(console.error);
