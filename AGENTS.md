# NestJS Backend Conventions

## Critical Implementation Guidelines

1. **No Any Types**: Strictly forbidden. Use `unknown` or specific types.
2. **No Explicit Return Types**: Omit unless absolutely necessary for clarity.
3. **No default exports**: Always use named exports, use default only if needed.
4. **Concise Comments**: Only where logic is complex or not obvious, keep short.
5. **Communication**: Be extremely concise and give answers like an engineer.

## Naming Conventions

<<<<<<< Updated upstream
<<<<<<< Updated upstream
1. **Files**: Kebab-case (`user-profile.service.ts`)
2. **Classes**: PascalCase (`UserProfileService`)
3. **Interfaces/Types**: PascalCase (`OAuthUserInfo`)
4. **Variables/Functions**: CamelCase (`findUserById`)
5. **Database Columns**: Snake_case (`email_verified_at`)
6. **Constants**: UPPERCASE_WITH_UNDERSCORES (`ARGON2_OPTIONS`)
7. **Enums**: PascalCase (`Environment`)
=======
=======
>>>>>>> Stashed changes
| Category            | Convention                 | Example         |
| ------------------- | -------------------------- | --------------- |
| Folders/Files       | camelCase                  | `createUser.ts` |
| Variables/Functions | camelCase                  | `updateSession` |
| Schemas             | PascalCase                 | `ErrorSchema`   |
| Types               | PascalCase                 | `GitHubEmail`   |
| Enums               | PascalCase                 | `Provider`      |
| Database Columns    | snake_case                 | `created_at`    |
| Constants           | UPPERCASE_WITH_UNDERSCORES | `ELYSIA_ERRORS` |
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

## Tech Stack

| Category      | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | NestJS 11                                     |
| Database      | PostgreSQL 18                                 |
| ORM           | TypeORM                                       |
| Language      | TypeScript                                    |
| Validation    | class-validator, class-transformer            |
| Auth          | Custom session-based + OAuth (Google, GitHub) |
| Password Hash | Argon2 (@node-rs/argon2)                      |
| Crypto        | @oslojs/crypto, @oslojs/encoding              |
| Testing       | Jest 30 with SWC                              |
| CLI           | nest-commander                                |
| Scheduling    | @nestjs/schedule                              |
| Rate Limiting | @nestjs/throttler                             |
| Security      | helmet, cookie-parser, signed cookies         |

## Project Structure

```
├── db/
│   ├── init/
│   └── migrations/
├── src/
<<<<<<< Updated upstream
<<<<<<< Updated upstream
│   ├── cli/
│   ├── common/
│   ├── crons/
│   ├── features/
│   ├── app.module.ts
│   ├── cli.ts
│   └── main.ts
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── .swcrc
=======
=======
>>>>>>> Stashed changes
│   ├── common/
│   ├── crons/
│   ├── database/
│   ├── queries/
│   └── index.ts
├── build.ts
>>>>>>> Stashed changes
├── compose.yml
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

<<<<<<< Updated upstream
<<<<<<< Updated upstream
### CLI (`src/cli/`)

Command-line interface using nest-commander.

| File            | Purpose                            |
| --------------- | ---------------------------------- |
| `cli.module.ts` | CLI module definition              |
| `commands/`     | Individual command implementations |

### Common (`src/common/`)

Shared utilities across features. Not a NestJS module—just organized exports.

| Folder          | Purpose                                    |
| --------------- | ------------------------------------------ |
| `config/`       | Configuration and environment setup        |
| `constants/`    | Common constants used across the project   |
| `decorators/`   | Custom decorators for application behavior |
| `enums/`        | Enum definitions                           |
| `filters/`      | Error and exception handling               |
| `interceptors/` | Request/response transformation utilities  |
| `testing/`      | Testing utilities and helpers              |
| `types/`        | Shared type definitions                    |

### Crons (`src/crons/`)

Scheduled tasks using @nestjs/schedule.

| File              | Purpose                             |
| ----------------- | ----------------------------------- |
| `crons.module.ts` | Cron module definition              |
| `*.cron.ts`       | Individual cron job implementations |

### Features (`src/features/`)

Vertical slice architecture. Each feature is self-contained.

```
src/features/{feature}/
├── dto/                     # Request/response DTOs
├── entities/                # TypeORM entities
├── tests/                   # Unit/integration tests
├── {feature}.controller.ts  # HTTP handlers
├── {feature}.service.ts     # Business logic
├── {feature}.module.ts      # Module definition
└── {feature}.guard.ts       # Feature-specific guards (optional)
```

## Component Patterns

### Controllers

- Define routes and HTTP methods
- Use DTOs for request validation
- Delegate all logic to services
- Use `@Public()` for public routes
- Never contain business logic or direct DB access

### Services

- Contain all business rules
- Interact with DB via TypeORM repositories
- Accept optional `EntityManager` as last parameter
- Throw standard NestJS exceptions
- Never return HTTP-specific objects

### DTOs

- Use class-validator decorators with custom error messages
- Order decorators from most to least specific
- Use class-transformer when needed

### Entities

- Use TypeORM decorators
- Define relationships last
- Snake_case for column names

## Global Setup

### Bootstrap (`main.ts`)

- **Logger**: `['log', 'warn', 'error']`
- **CORS**: Enabled with `credentials: true`
- **Security**: Helmet, signed cookies, compression
- **Global Prefix**: `/api`
- **ValidationPipe**: `whitelist`, `transform`, `forbidNonWhitelisted`
- **Interceptors**: Logging → Timeout (30s) → Transform → ClassSerializer
- **Filters**: CatchAllFilter

### Global Guards (`app.module.ts`)

- **ThrottlerGuard**: Rate limiting
- **AuthGuard**: Session-based authentication

### Response Format

- **Success**: `{ success: true, data: '...' }`
- **Error**: `{ success: false, message: '...' }`

## Environment Variables

Required in `.env` (see `.env.example`):

| Variable               | Description                     |
| ---------------------- | ------------------------------- |
| `PORT`                 | Server port                     |
| `NODE_ENV`             | development, production, test   |
| `FRONTEND_URL`         | CORS origin                     |
| `COOKIE_SECRET`        | Min 32 chars for signed cookies |
| `DB_HOST`              | Database host                   |
| `DB_PORT`              | Database port                   |
| `DB_NAME`              | Database name                   |
| `DB_USERNAME`          | Database username               |
| `DB_PASSWORD`          | Database password               |
| `GOOGLE_CLIENT_ID`     | OAuth client ID                 |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret             |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL              |
| `GITHUB_CLIENT_ID`     | OAuth client ID                 |
| `GITHUB_CLIENT_SECRET` | OAuth client secret             |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL              |
=======
## Folder Guide

| Folder          | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `src/common/`   | Shared utilities, schemas, types, errors, etc.     |
| `src/crons/`    | Scheduled tasks                                    |
| `src/database/` | Database connection, schema, migrations, relations |
| `src/queries/`  | Database queries                                   |
| `src/index.ts`  | Main entry point, app setup, and route definitions |

## Environment Variables

=======
## Folder Guide

| Folder          | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `src/common/`   | Shared utilities, schemas, types, errors, etc.     |
| `src/crons/`    | Scheduled tasks                                    |
| `src/database/` | Database connection, schema, migrations, relations |
| `src/queries/`  | Database queries                                   |
| `src/index.ts`  | Main entry point, app setup, and route definitions |

## Environment Variables

>>>>>>> Stashed changes
| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `PORT`                 | Server port                  |
| `NODE_ENV`             | development / production     |
| `SESSION_SECRET`       | Min 32 chars for cookies     |
| `FRONTEND_URL`         | CORS origin for frontend     |
| `DATABASE_URL`         | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID`     | OAuth client ID              |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret          |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL           |
| `GITHUB_CLIENT_ID`     | OAuth client ID              |
| `GITHUB_CLIENT_SECRET` | OAuth client secret          |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL           |
>>>>>>> Stashed changes

## npm Scripts

| Script                              | Description                      |
| ----------------------------------- | -------------------------------- |
| `npm run dev`                       | Start dev server with watch mode |
| `npm run build`                     | Build for production             |
| `npm run start`                     | Run production build             |
| `npm run format`                    | Format code with Prettier        |
| `npm run test`                      | Run tests with Jest              |
| `npm run cli`                       | Run CLI (shows help)             |
| `npm run cli db:seed`               | Seed database with test user     |
| `npm run migration:create --name=X` | Create new migration             |
| `npm run migration:revert`          | Revert last migration            |
| `npm run migration:show`            | Show migration status            |
| `npm run migration:run`             | Run pending migrations           |

## Architecture & Patterns

<<<<<<< Updated upstream
<<<<<<< Updated upstream
Single PostgreSQL container with two databases:

- **db**: Dev database
- **db_test**: Test database

## Testing

- **Framework**: Jest 30 with SWC
- **Test files**: `*.spec.ts` in `tests/` folders within features
- **TestModule**: Pre-configured module in `common/testing/`
- **Fixtures**: Factory functions for creating test data
- **Validation helpers**: Functions for validating common results

## Authentication

- **Session-based**: Signed HTTP-only cookie (`auth-session`)
- **Session duration**: 30 days, auto-renews within 15 days of expiry
- **OAuth**: Google/GitHub with state cookie for CSRF protection
- **AuthGuard**: Global guard validates session on every request
- **@Public()**: Decorator to bypass auth on specific routes
=======
### 1. Main Application (`src/index.ts`)

- **Role**: Entry point, Server configuration, Route definitions.
- **Contents**:
    - Global error handling and error class registration.
    - Global middleware (CORS, Security Headers, OpenAPI).
    - Authentication macro and guards setup.
    - Route registration and cookie management.
    - All business logic in route handlers.
>>>>>>> Stashed changes

### 2. Common Utilities (`src/common/`)

<<<<<<< Updated upstream
1. Create `src/features/{name}/` directory
2. Define entity in `entities/`
3. Create DTOs in `dto/`
4. Implement service in `{name}.service.ts`
5. Create controller in `{name}.controller.ts`
6. Define module in `{name}.module.ts`
7. Import module in `app.module.ts`
8. Create migration if needed
9. Add tests in `tests/`
=======
=======
### 1. Main Application (`src/index.ts`)

- **Role**: Entry point, Server configuration, Route definitions.
- **Contents**:
    - Global error handling and error class registration.
    - Global middleware (CORS, Security Headers, OpenAPI).
    - Authentication macro and guards setup.
    - Route registration and cookie management.
    - All business logic in route handlers.

### 2. Common Utilities (`src/common/`)

>>>>>>> Stashed changes
- **Role**: Shared resources used across the application.
- **Contents**:
    - `constants.ts`: Global constants (e.g., Session duration).
    - `cookie.ts`: Cookie configuration and schemas.
    - `crypto.ts`: Hashing and token generation helpers.
    - `enums.ts`: TypeScript enums (Provider, OpenApiTag).
    - `env.ts`: Type-safe environment variable validation.
    - `errors.ts`: Custom error classes and error handling logic.
    - `oauth.ts`: OAuth flow handlers.
    - `schemas.ts`: TypeBox schemas for validation (Request/Response).
    - `types.ts`: Shared TypeScript interfaces and types.

### 3. Cron Jobs (`src/crons/`)

- **Role**: Scheduled background tasks.
- **Contents**:
    - `index.ts`: List of cron jobs active in our application.

### 4. Database Layer (`src/database/`)

- **Role**: Database configuration and definition.
- **Contents**:
    - `index.ts`: Drizzle client initialization and migration runner.
    - `schema.ts`: Table definitions using Drizzle ORM.
    - `relations.ts`: Relationship definitions between tables.
- **Conventions**:
    - Use snake_case for database columns.
    - Use UUIDv7 for primary keys.

### 5. Data Access Layer (`src/queries/`)

- **Role**: Pure functions to interact with the database.
- **Conventions**:
    - **No Business Logic**: Only database queries without any extra code.
    - **Transactions**: Optional `tx` parameter as the last argument.
    - **Usage**: Imported and used in `src/index.ts` routes.

## Implementation Details

### Response Format

- **Success**: Data returned directly from handlers.
- **Error**: Handled globally, returns `{ code: '...', message: '...', errors?: {...} }`.

```typescript
// Success Sample
{ id: 1, name: 'Alice', email: 'alice@gmail.com', image: null };

// Error Sample
{ code: "VALIDATION_ERROR", message: "Unprocessable Entity", errors: { email: "Email is invalid" } }
```

### Authentication

- **Mechanism**: Session-based with signed HTTP-only cookies.
- **Flows**: Credentials (Email/Password) and OAuth (Google, GitHub).
- **Protection**: Use `{ auth: true }` in route config to enforce session validation.

```typescript
// Protected Route
.get('/protected', handler, { auth: true })
```

### Validation

- **Library**: TypeBox (via `elysia`).
- **Location**: Define schemas in `src/common/schemas.ts`.
- **Usage**: Pass to route config for `body`, `query`, `params`, or `response`.

```typescript
// UserSchema for Request/Response validation
export const UserSchema = t.Object({ ... });
.post('/route1', handler, { body: UserSchema })
.post('/route2', handler, { response: { 200: Userschema } })
```

### Database & Migrations

- **ORM**: Drizzle ORM.
- **Workflow**:
    1. Add/update schema `src/database/schema.ts`.
    2. Add/update relations `src/database/relations.ts`
    3. Run `bun run db:generate` to create SQL migration files.

```typescript
// Database Table Definition
export const users = pgTable('users', {
    id: uuid().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
});
```

### Environment Variables

- **File**: `.env` (gitignored), `.env.example` (template).
- **Validation**: Defined in `src/common/env.ts`.
- **Usage**: Import `env` from `@/common/env`.

```typescript
// Validated env Object
import { env } from '@/common/env';
(env.PORT, env.NODE_ENV);
```

### Cron Jobs

- **Plugin**: `@elysiajs/cron`.
- **Location**: `src/crons/index.ts`.
- **Setup**: `.use(cron({...}))`.

```typescript
// Cron Job with defined execution time
cron({
    name: 'cleanup',
    pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
    run() { ... }
})
```

### Error Handling

- **Strategy**: Throw typed errors from `@/common/errors`.
- **Global Handler**: Catches errors and formats the response.

```typescript
// Import and throw
import { NotFoundError, UnauthorizedError } from '@/common/errors';
throw new NotFoundError();
throw new UnauthorizedError();
```

### Feature Workflow

1.  **Database**: Add tables to `src/database/schema.ts` & relations to `src/database/relations.ts`.
2.  **Queries**: Add queries to `src/queries/feature.ts` & make transaction optional last parameter.
3.  **Schemas**: Add schemas to `src/common/schemas.ts` & inferred types to `src/common/types.ts`.
4.  **Errors**: Throw errors at `src/common/errors.ts` & let global error handlers deal with them.
5.  **Routes**: Setup routes at `src/index.ts` & write all business logic to the route handlers.
6.  **Guards**: Apply guards at `src/index.ts` & apply `{ auth: true }` for protected routes.
7.  **OpenAPI**: Add schemas to `src/index.ts` for Request/Response validation with details.
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
