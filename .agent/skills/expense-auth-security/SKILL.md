---
name: expense-auth-security
description: Use this skill when implementing authentication, authorization, JWT token handling, password hashing, or any security-related feature in the Expense Tracker backend. Covers the Passport-JWT strategy, authenticate middleware, JWT token generation via jwt.util.js, bcrypt password handling, and route protection. Trigger when user mentions auth, login, register, passwords, tokens, middleware, protected routes, or access control.

# Expense Tracker — Authentication & Security

## Authentication Flow

```
Client → Authorization: Bearer <token> → Passport-JWT → req.user → Controller
```

JWT is extracted from the `Authorization` header using `ExtractJwt.fromAuthHeaderAsBearerToken()`.

After verification, `req.user` contains the full Mongoose User document (including `_id`, `email`, `firstName`, `lastName`, `categories`).

## Passport-JWT Strategy

Configured in `src/config/passport.js`:

```javascript
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

// Finds user by _id from JWT payload
passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    const user = await User.findById(jwt_payload._id);
    return user ? done(null, user) : done(null, false);
}));
```

## Auth Middleware Usage

```javascript
import authenticate from "../middleware/auth.middleware.js";

// Protected route — requires valid JWT
router.use("/transaction", authenticate, transactionRoutes);

// Public route — no auth needed
router.use("/auth", authRoutes);
router.use("/stats", statsRoutes);
```

The `authenticate` middleware:
1. Calls `passport.authenticate("jwt", { session: false })`
2. If no user found: throws `AppError("Unauthorized access", 401)`
3. If user found: sets `req.user = user` and calls `next()`

## JWT Token Generation

Via `src/utils/jwt.util.js`:

```javascript
import { generateToken, createUserPayload } from "../utils/jwt.util.js";

// Create payload from user object
const payload = createUserPayload(user);
// payload = { _id: user._id, username: user.email }

// Generate token (default expiry: 1h)
const token = generateToken(payload);
// or with custom expiry:
const token = generateToken(payload, "72h");
```

## Password Handling

- **Hashing**: `bcrypt.genSalt(10)` then `bcrypt.hash(password, salt)` — salt rounds = 10
- **Comparing**: `bcrypt.compare(plainPassword, user.password)`
- **Registration flow**: Check user exists → hash password → create user with DEFAULT_CATEGORIES

## Route Protection Table

| Route Prefix | Auth Required | File |
|-------------|:---:|------|
| `/auth` | ❌ | `auth.routes.js` |
| `/stats` | ❌ | `stats.routes.js` |
| `/user` | ❌ | `user.routes.js` |
| `/transaction` | ✅ | `transaction.routes.js` |
| `/budget` | ✅ | `budget.routes.js` |
| `/recurring` | ✅ | `recurring-transaction.routes.js` |
| `/reports` | ✅ | `reports.routes.js` |
| `/dashboard` | ✅ | `dashboard.routes.js` |
| `/category` | ✅ | `category.routes.js` |

## Frontend Token Handling

The client stores JWT in cookies via `js-cookie`:

```javascript
import Cookies from "js-cookie";
const token = Cookies.get("token");
// Sent as: Authorization: `Bearer ${token}`
```

## Environment Variables

```env
JWT_SECRET=your_secret_key_here  # REQUIRED for token signing/verification
```

## Related Skills

- **expense-api-scaffold** — how to create the controller/route that uses auth
- **expense-state-api** — frontend API client that sends Bearer tokens
