# Backend Architecture Documentation

## Overview

This is a refactored Express.js backend following modern best practices with clean architecture principles.

## Directory Structure

### `/src/config/` - Configuration Files
Configuration for external services and frameworks.

- **database.js** - MongoDB connection setup
- **passport.js** - JWT authentication strategy (uses async/await)
- **redis.js** - Redis client configuration

### `/src/constants/` - Application Constants
Centralized constants to avoid magic strings.

- **categories.js** - Default user categories
- **errorMessages.js** - Standard error messages
- **index.js** - Barrel export for all constants

### `/src/controllers/` - HTTP Request Handlers
Thin controllers that handle HTTP requests/responses only. Business logic delegated to services.

**Pattern:**
```javascript
export const operationName = asyncHandler(async (req, res) => {
  const result = await service.operation(req.body, req.user._id);
  sendSuccess(res, result, "Success message");
});
```

### `/src/services/` - Business Logic Layer
Core business logic separated from HTTP concerns. Testable independently.

**Key Services:**
- **auth.service.js** - Registration, login, password hashing
- **transaction.service.js** - Transaction CRUD, search, duplicate detection, AI suggestions
- **budget.service.js** - Budget management, spending calculations
- **recurring-transaction.service.js** - Recurring transactions, scheduling
- **dashboard.service.js** - Analytics aggregation
- **reports.service.js** - Report generation
- **category.service.js** - Category management
- **user.service.js** - User profile management
- **stats.service.js** - Global statistics with caching

### `/src/middleware/` - Express Middleware
Cross-cutting concerns applied to routes.

- **async-handler.middleware.js** - Wraps async functions to catch errors automatically
- **error.middleware.js** - Centralized error handling with custom `AppError` class
- **auth.middleware.js** - JWT authentication using Passport
- **validate.middleware.js** - Request validation (ready for validators)

### `/src/validators/` - Request Validation
Directory ready for validation schemas (e.g., using Joi or express-validator).

### `/src/utils/` - Utility Functions
Reusable pure functions for common operations.

- **response.util.js** - Standardized API responses (`sendSuccess`, `sendError`, etc.)
- **jwt.util.js** - JWT token generation and verification
- **csv.util.js** - CSV export functionality
- **similarity.util.js** - String similarity (Dice coefficient)
- **date.util.js** - Date calculations for recurring transactions

### `/src/models/` - Mongoose Models
Database schemas and models.

- **User.js** - User model with categories
- **Transaction.js** - Transaction model
- **Budget.js** - Budget model
- **RecurringTransaction.js** - Recurring transaction model

### `/src/routes/` - Route Definitions
API route definitions organized by feature.

**Pattern:**
```javascript
import { Router } from "express";
import * as controller from "../controllers/feature.controller.js";

const router = Router();
router.get("/", controller.method);
export default router;
```

---

## Architecture Principles

### 1. Separation of Concerns
- **Controllers**: HTTP only (request/response)
- **Services**: Business logic
- **Utils**: Reusable functions
- **Middleware**: Cross-cutting concerns

### 2. Error Handling
All errors are caught and handled consistently:
```javascript
// Operational errors
throw new AppError("Custom message", 404);

// Automatic handling of:
// - Mongoose validation errors
// - Duplicate key errors  
// - Cast errors (invalid ObjectId)
// - JWT errors
```

### 3. Response Standardization
All API responses follow a consistent format:
```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, message: "..." }
```

---

## Usage Examples

### Creating a New Feature

1. **Create Service** (`src/services/feature.service.js`)
```javascript
class FeatureService {
  async getAll(userId) {
    // Business logic here
    return data;
  }
}
export default new FeatureService();
```

2. **Create Controller** (`src/controllers/feature.controller.js`)
```javascript
import featureService from "../services/feature.service.js";
import asyncHandler from "../middleware/async-handler.middleware.js";
import { sendSuccess } from "../utils/response.util.js";

export const getAll = asyncHandler(async (req, res) => {
  const data = await featureService.getAll(req.user._id);
  sendSuccess(res, data);
});
```

3. **Create Routes** (`src/routes/feature.routes.js`)
```javascript
import { Router } from "express";
import * as featureController from "../controllers/feature.controller.js";

const router = Router();
router.get("/", featureController.getAll);
export default router;
```

4. **Register in Main Router** (`src/routes/index.js`)
```javascript
import featureRoutes from "./feature.routes.js";
router.use("/feature", authenticate, featureRoutes);
```

---

## Testing

Services can be tested independently:
```javascript
import featureService from "../services/feature.service.js";

describe("FeatureService", () => {
  it("should return all items", async () => {
    const result = await featureService.getAll(userId);
    expect(result).toBeDefined();
  });
});
```

---

## Environment Variables Required

```env
PORT=4000
MONGO_DB_USERNAME=your_username
MONGO_DB_PASSWORD=your_password
MONGO_DB_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

---

## Benefits of This Architecture

✅ **Maintainable** - Clear separation makes changes easier  
✅ **Testable** - Services can be unit tested independently  
✅ **Scalable** - Easy to add new features following patterns  
✅ **DRY** - Reusable utilities and middleware  
✅ **Consistent** - Standardized error handling and responses  
✅ **Professional** - Follows industry best practices
