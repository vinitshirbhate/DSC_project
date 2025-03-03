
# Redis & MemoryCache Integration

This repository provides a Redis singleton instance for persistent caching and a lightweight in-memory cache for temporary storage. The combination of both ensures efficient and reliable data management for Hono applications.

---

## 🔥 Redis Singleton
The `RedisSingleton` class provides a globally accessible Redis client with a default TTL (Time-To-Live) for setting values.

### Features:
- Singleton pattern ensures only one Redis instance is created.
- Default TTL of 1 hour (3600 seconds) for all keys.
- Supports overriding TTL when setting values.


### Usage:
```ts
await RedisSingleton.set(c, "user:123", { name: "John Doe", age: 30 }); // Uses default TTL
await RedisSingleton.set(c, "user:456", { name: "Jane Doe", age: 25 }, 7200); // Custom TTL of 2 hours
```

---

## 🚀 MemoryCache (In-Memory Storage)
The `MemoryCache` class provides an in-memory cache with optional expiration for quick access.

### Features:
- Stores key-value pairs in memory.
- Supports TTL-based expiration.
- Provides methods for setting, retrieving, deleting, and clearing the cache.

### Usage:
```ts
MemoryCache.setMemory("session:123", { data: "some session data", expiry: Date.now() + 60000 }); // Expires in 1 minute
const session = MemoryCache.getMemory("session:123"); // Retrieve session data
MemoryCache.delete("session:123"); // Remove specific key
MemoryCache.clear(); // Clear all cache
```

---

## 🛠 Setting Up Wrangler for Hono
To run the Hono application with Cloudflare Workers, you need a `wrangler.jsonc` file.

### Steps:
1. Copy `wrangler.sample.jsonc` to `wrangler.jsonc`.
2. Update the required fields like `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `kv_namespaces`.
3. Run the following command to start the Hono application:
   ```sh
   wrangler dev
   ```

### Sample `wrangler.jsonc` File:
```jsonc
{
  "compatibility_date": "2024-03-03",
  "node_compat": true,
  "env": {
    "production": {
      "UPSTASH_REDIS_REST_URL": "your-redis-url",
      "UPSTASH_REDIS_REST_TOKEN": "your-redis-token"
    }
  }
}
```

---

## 🔗 Conclusion
- Use **RedisSingleton** for persistent caching with automatic TTL.
- Use **MemoryCache** for quick, temporary data storage.
- Configure **wrangler.jsonc** properly to run the Hono app with Cloudflare Workers.


## Run scripts 

```
npm install
npm run dev
```

```
npm run deploy
```