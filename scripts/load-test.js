// Native fetch is available in Node 18+


const BASE_URL = 'http://localhost:3000/api';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureRequest(label, url) {
    const start = performance.now();
    const res = await fetch(url);
    const end = performance.now();
    const duration = end - start;

    let body = {};
    try {
        body = await res.json();
    } catch (e) {
        body = { error: 'Invalid JSON' };
    }

    console.log(`[${label}] Status: ${res.status}, Time: ${duration.toFixed(2)}ms`); //, Body:`, body);
    return { status: res.status, duration, body };
}

async function testCaching() {
    console.log('\n--- Testing Caching & Performance ---');

    // 1st Request (Cold)
    const req1 = await measureRequest('Cold Cache', `${BASE_URL}/users/1`);
    if (req1.duration < 200) console.warn('WARNING: Cold cache response too fast, mock delay might be failing?');

    // 2nd Request (Warm)
    const req2 = await measureRequest('Warm Cache', `${BASE_URL}/users/1`);
    if (req2.duration > 50) console.warn('WARNING: Warm cache response too slow!');
    else console.log('SUCCESS: Cache hit confirmed (response near instant).');
}

async function testConcurrency() {
    console.log('\n--- Testing Concurrency (Request Coalescing) ---');
    console.log('Sending 5 simultaneous requests for User 2 (Cold Cache)...');

    const start = performance.now();
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(measureRequest(`Concurrent #${i + 1}`, `${BASE_URL}/users/2`));
    }

    await Promise.all(promises);
    const end = performance.now();
    console.log(`Total time for batch: ${(end - start).toFixed(2)}ms`);
    console.log('Observation: All requests should return around the same time (~200ms) if coalescing works.');
}

async function testRateLimiting() {
    console.log('\n--- Testing Rate Limiting ---');
    console.log('Sending 15 requests rapidly...');

    let blockedCount = 0;
    for (let i = 0; i < 15; i++) {
        const res = await measureRequest(`Req #${i + 1}`, `${BASE_URL}/users/3`);
        if (res.status === 429) {
            blockedCount++;
        }
    }

    if (blockedCount > 0) {
        console.log(`SUCCESS: Rate limiter blocked ${blockedCount} requests.`);
    } else {
        console.error('FAILURE: Rate limiter did not block any requests!');
    }
}

async function runTests() {
    console.log('Starting Load Test...');

    // Check if server is up
    try {
        const health = await fetch(`${BASE_URL}/cache-status`);
        if (health.status !== 200) throw new Error('Server not ready');
    } catch (e) {
        console.error('ERROR: Could not connect to server. Make sure it is running on port 3000.');
        console.error('Run: npm run dev');
        process.exit(1);
    }

    // Clear cache to start fresh
    await fetch(`${BASE_URL}/cache`, { method: 'DELETE' });

    await testCaching();
    await sleep(1000);

    await testConcurrency();
    await sleep(1000);

    // Clear cache again before rate limit test to ensure consistent baseline? 
    // Actually rate limits are IP based, so cache doesn't matter much aside from speed.
    await testRateLimiting();

    console.log('\n--- Test Complete ---');
}

// Check for native fetch (Node 18+)
if (!global.fetch) {
    console.error('This script requires Node 18+ for native fetch.');
    process.exit(1);
}

runTests();
