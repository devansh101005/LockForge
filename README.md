# LockForge

A distributed lock service built with TypeScript, Express, and Redis.

## The problem

Two servers pick up the same order. Both charge the customer. Double payment. LockForge prevents this — one server locks the resource, the other backs off.

## How it works

Redis `SET NX PX` is the lock. `NX` means "only set if key doesn't exist" — so only one caller wins. `PX` sets a TTL in milliseconds so locks auto-expire if the owner crashes. Release and extend use Lua scripts for atomic check-and-act (no race conditions).

## Quick start

### With Docker

```bash
cd lockforge
docker compose up --build
```

### Without Docker

Make sure Redis is running on port 6379, then:

```bash
cd lockforge
npm install
npm run dev
```

Server starts on `http://localhost:3000`.

## API

### Health check

```
GET /health
```

### Acquire a lock

```bash
curl -X POST http://localhost:3000/lock/order-456 \
  -H "Content-Type: application/json" \
  -d '{"owner": "server-a", "ttl": 30000}'
```

Returns 200 if acquired, 409 if already locked by someone else.

### Release a lock

```bash
curl -X DELETE http://localhost:3000/lock/order-456 \
  -H "Content-Type: application/json" \
  -d '{"owner": "server-a"}'
```

Returns 200 if released, 403 if you're not the owner, 404 if not locked.

### Check lock status

```bash
curl http://localhost:3000/lock/order-456
```

### Extend a lock

```bash
curl -X PUT http://localhost:3000/lock/order-456/extend \
  -H "Content-Type: application/json" \
  -d '{"owner": "server-a", "ttl": 60000}'
```

### List all active locks

```
GET /locks
```

## Environment variables

```
REDIS_URL=redis://localhost:6379/3
PORT=3000
DEFAULT_TTL=30000
```

## Project structure

```
lockforge/
  src/
    config/redis.ts        - Redis connection
    internal/types.ts      - Interfaces
    internal/lockManager.ts - Core lock logic (acquire, release, check, extend, list)
    routes/locks.ts        - Express routes
    index.ts               - Server entry point
```

## Tech stack

TypeScript, Express, ioredis, Redis, Docker
