---
name: expense-api-scaffold
description: Use this skill when creating a new API endpoint, adding a new feature module, or scaffolding backend code for the Expense Tracker. Covers the full creation workflow — service (business logic) → controller (thin HTTP handler) → route → wiring into the main router. Follows project conventions for asyncHandler, sendSuccess/AppError responses, ESM imports, and file naming. Trigger when user mentions adding a new endpoint, new API route, new feature, new module, or scaffolding backend code.

# Expense Tracker — API Module Scaffold

## Project Structure

Backend code lives in `src/` with this flat structure (NOT module-based):

```
src/
├── config/          # database.js, passport.js, redis.js
├── constants/       # categories.js, errorMessages.js, index.js
├── controllers/     # Thin HTTP handlers: <feature>.controller.js
├── middleware/      # asyncHandler, auth, error, validate
├── models/          # Mongoose models: <Model>.js (PascalCase)
├── routes/          # Express routes: <feature>.routes.js
├── services/       # Business logic: <feature>.service.js
└── utils/          # response.util.js, jwt.util.js, csv.util.js, etc.
```

## Step-by-Step: Add a New Feature

### 1. Create Service (Business Logic First)

```javascript
import { AppError } from "../middleware/error.middleware.js";

class FeatureService {
    async getAll(userId) {
        // Business logic — query models, transform data
        // Throw AppError for expected errors:
        throw new AppError("Resource not found", 404);
    }

    async create(data, userId) {
        // Validation + creation logic
    }
}

// ALWAYS export as singleton
export default new FeatureService();
```

### 2. Create Controller (Thin Layer)

```javascript
import featureService from "../services/feature.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess, sendCreated } from "../utils/response.util.js";

// ALWAYS wrap with asyncHandler — NO try-catch in controllers
export const getAll = asyncHandler(async (req, res) => {
    const data = await featureService.getAll(req.user._id);
    sendSuccess(res, data);
});

export const create = asyncHandler(async (req, res) => {
    const result = await featureService.create(req.body, req.user._id);
    sendCreated(res, result, "Feature created successfully");
});
```

### 3. Create Routes

```javascript
import { Router } from "express";
import * as featureController from "../controllers/feature.controller.js";

const router = Router();

router.get("/", featureController.getAll);
router.post("/", featureController.create);
router.patch("/:id", featureController.update);
router.delete("/:id", featureController.destroy);

export default router;
```

### 4. Wire into Main Router (`src/routes/index.js`)

```javascript
// Add import
import featureRoutes from "./feature.routes.js";

// Public route (no auth):
router.use("/feature", featureRoutes);

// Protected route (requires authentication):
router.use("/feature", authenticate, featureRoutes);
```

### 5. Add Error Messages (`src/constants/errorMessages.js`)

```javascript
// Add to ERROR_MESSAGES object:
FEATURE_NOT_FOUND: "Feature not found",
FEATURE_CREATED: "Feature created successfully",
FEATURE_UPDATED: "Feature updated successfully",
FEATURE_DELETED: "Feature deleted successfully",
```

## Key Conventions

| Convention | Pattern |
|-----------|---------|
| Error class | `AppError(message, statusCode)` from `error.middleware.js` |
| Controllers | Always wrap with `asyncHandler()`, never try-catch |
| Success responses | `sendSuccess(res, data, message, statusCode)` |
| Created responses | `sendCreated(res, data, message)` → 201 |
| Error responses | `sendError(res, message, statusCode)` |
| Not found | `sendNotFound(res, message)` → 404 |
| Validation error | `sendValidationError(res, message, errors)` → 400 |
| Auth user | `req.user._id` after `authenticate` middleware |
| Imports | ESM with `.js` extension always |
| Services | Class pattern, exported as singleton (`new FeatureService()`) |
| Models | PascalCase filenames (`Transaction.js`) |
| Routes/Controllers | kebab-case or dot notation (`transaction.controller.js`) |

## Related Skills

- **expense-auth-security** — how to protect routes with `authenticate` middleware
- **expense-database** — Mongoose schema conventions when your feature needs a model
- **expense-financial-logic** — domain-specific business logic patterns
