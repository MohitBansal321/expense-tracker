---
name: expense-deployment
description: Use this skill when deploying, configuring environments, debugging server startup, managing Redis/MongoDB connections, or handling production settings for the Expense Tracker. Covers environment variables, server startup sequence, CORS, middleware stack order, production static file serving, Redis/MongoDB connection config, and the Node 18.x engine requirement. Trigger when user mentions deploy, production, environment variables, .env, server config, middleware, CORS, Redis, MongoDB connection, hosting, or infrastructure.

# Expense Tracker — Deployment & Operations

## Server Startup Sequence

```
server.js → dotenv.config() → Express app
    → cors()
    → bodyParser.json()
    → passport.initialize() + passportConfig()
    → routes
    → notFoundHandler
    → errorHandler
    → database.connect()
    → app.listen(PORT)
```

## Environment Variables

Create `.env` in project root:

```env
PORT=4000                           # Server port (default: 4000)
MONGO_DB_USERNAME=your_username     # MongoDB Atlas username
MONGO_DB_PASSWORD=your_password     # MongoDB Atlas password
MONGO_DB_URL=your_cluster_url       # MongoDB Atlas cluster URL (without mongodb+srv://)
JWT_SECRET=your_secret_key          # JWT signing secret — REQUIRED
NODE_ENV=development                # "development" or "production"
REDIS_PASSWORD=your_redis_password  # Redis Cloud password (optional)
```

Client `.env` (in `client/` directory):

```env
VITE_BASE_URL=http://localhost:4000  # Backend API URL
```

## Middleware Stack Order

```
1. CORS (origin: *, all methods)
2. Body parser (JSON)
3. Passport initialize + JWT strategy
4. Routes (public + authenticated)
5. 404 Not Found handler
6. Error handler (centralized)
```

## Production Mode

When `NODE_ENV=production`:
- Static files served from `client/build/`
- All non-API routes serve `index.html` (SPA routing)
- Error responses exclude stack traces

```javascript
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "./client/build")));
    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "./client", "build", "index.html"))
    );
}
```

## Database Connection

`src/config/database.js` constructs MongoDB URI:
```
mongodb+srv://${username}:${password}@${url}/?retryWrites=true&w=majority
```

Uses top-level `await connect()` in `server.js`.

## Redis Connection

`src/config/redis.js` — currently hardcoded Redis Cloud host. Uses top-level `await client.connect()`.

> **Known issue**: Server crashes if Redis connection fails. Recommended fix: make Redis optional with graceful fallback (see `BACKEND_CHECKLIST.md`).

## Build & Run Commands

| Command | Purpose |
|---------|---------|
| `npm start` (root) | `nodemon server.js` — dev server with auto-restart |
| `npm run dev` (client) | `vite` — frontend dev server |
| `npm run build` (client) | `vite build` — production frontend build |
| `node server.js` | Direct server start (production) |

## Engine Requirements

```json
{ "engines": { "node": "18.x" } }
```

## Key Files

- `server.js` — Entry point, Express setup
- `src/config/database.js` — MongoDB connection
- `src/config/redis.js` — Redis connection
- `src/config/passport.js` — JWT strategy
- `client/vite.config.js` — Vite bundler config
- `BACKEND_CHECKLIST.md` — Known issues and next steps

## Related Skills

- **expense-auth-security** — JWT_SECRET and passport config details
- **expense-database** — MongoDB and Redis patterns
