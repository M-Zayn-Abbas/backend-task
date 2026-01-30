# Expert Express.js API Task

## Overview
This project implements a high-performance Express.js API with:
- **LRU Caching**: Custom in-memory cache with TTL (60s) and eviction.
- **Rate Limiting**: Token Bucket strategy (10 req/min, burst 5).
- **Request Coalescing**: Preventing Thundering Herd problem for concurrent DB fetches.
- **Async Queueing**: Asynchronous processing simulation.
- **Monitoring**: Response time logging.

## Setup
1. Unzip or clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   npm run build
   npm start
   ```

## Testing
To verify the system requirements (Caching, Rate Limiting, Concurrency), run the load test script:
1. Ensure the server is running (`npm run dev`).
2. Run the test script:
   ```bash
   node scripts/load-test.js
   ```
   **Note**: If you are on an older Node version (<18), you may need to `npm install node-fetch`.

## API Endpoints

### Users
- **GET /api/users/:id**
  - Fetches user by ID.
  - Cached for 60 seconds.
  - Mock IDs: 1, 2, 3.
  - Returns 200 (User object) or 404 (Not Found).

- **POST /api/users** (Bonus)
  - Creates a simulated user and caches it.
  - Body: `{ "id": 4, "name": "Test", "email": "test@test.com" }`

### Cache
- **GET /api/cache-status**
  - Returns current cache stats (hits, misses, size).

- **DELETE /api/cache**
  - Clears the cache.

## Architecture
- `src/services/CacheService.ts`: LRU Implementation.
- `src/services/DatabaseService.ts`: Mock DB with Request Coalescing.
- `src/middleware/rateLimiter.ts`: Token Bucket Middleware.
- `src/middleware/monitor.ts`: Response time monitor.
