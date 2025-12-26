# Backend Conventions

## Critical Implementation Guidelines

1. **No Any Types**: Strictly forbidden. Use `unknown` or specific types.
2. **No Explicit Return Types**: Omit unless absolutely necessary for clarity.
3. **No Default Exports**: Always use named exports, use default only if needed.
4. **Concise Comments**: Only where logic is complex or not obvious, keep short.

## Naming Conventions

| Category            | Convention                 | Example         |
| ------------------- | -------------------------- | --------------- |
| Folders/Files       | camelCase                  | `createUser.ts` |
| Variables/Functions | camelCase                  | `updateSession` |
| Schemas             | PascalCase                 | `ErrorSchema`   |
| Types               | PascalCase                 | `GitHubEmail`   |
| Enums               | PascalCase                 | `Provider`      |
| Database Columns    | snake_case                 | `created_at`    |
| Constants           | UPPERCASE_WITH_UNDERSCORES | `ELYSIA_ERRORS` |

## Tech Stack

| Category   | Technology    |
| ---------- | ------------- |
| Runtime    | Bun           |
| Framework  | Elysia        |
| Language   | TypeScript    |
| Database   | PostgreSQL 18 |
| ORM        | Drizzle ORM   |
| Migrations | Drizzle Kit   |
| Validation | TypeBox       |

## Project Structure

```
├── migrations/
├── src/
│   ├── common/
│   ├── crons/
│   ├── database/
│   ├── queries/
│   └── index.ts
├── build.ts
├── compose.yml
├── Dockerfile
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Folder Guide

| Folder          | Purpose          |
| --------------- | ---------------- |
| `src/common/`   | Shared utilities |
| `src/crons/`    | Scheduling tasks |
| `src/database/` | Database schemas |
| `src/queries/`  | Database queries |
| `src/index.ts`  | Main application |

## Environment Variables

| Variable               | Description              |
| ---------------------- | ------------------------ |
| `PORT`                 | Server Port              |
| `NODE_ENV`             | Development / Production |
| `SESSION_SECRET`       | Session Secret           |
| `FRONTEND_URL`         | Frontend URL             |
| `DATABASE_URL`         | Database URL             |
| `GOOGLE_CLIENT_ID`     | OAuth client ID          |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret      |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL       |
| `GITHUB_CLIENT_ID`     | OAuth client ID          |
| `GITHUB_CLIENT_SECRET` | OAuth client secret      |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL       |

## Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Start development server with hot reload |
| `bun run build`       | Build for production                     |
| `bun run start`       | Start production server                  |
| `bun run format`      | Format code with Prettier                |
| `bun run db:generate` | Generate migrations from schema changes  |
| `bun run db:migrate`  | Apply pending migrations                 |
| `bun run db:studio`   | Open Drizzle Studio database GUI         |
| `bun run db:check`    | Check migration consistency              |
| `bun run db:push`     | Push schema changes directly             |
| `bun run db:pull`     | Pull schema from database                |

## Architecture & Patterns

### 1. Main Application (`src/index.ts`)

- **Role**: Entry point, Server configuration, Route definitions.
- **Contents**:
    - Global error handling and error class registration.
    - Global middleware (CORS, Security Headers, OpenAPI).
    - Route registration and cookie management.
    - Authentication macro and guards setup.
    - All business logic in route handlers.

### 2. Common Utilities (`src/common/`)

- **Role**: Shared resources used across the application.
- **Contents**:
    - `constants.ts`: Global constants.
    - `cookie.ts`: Cookie configuration.
    - `crypto.ts`: Crypto helpers.
    - `enums.ts`: TypeScript enums.
    - `env.ts`: Environment variables.
    - `errors.ts`: Custom error classes.
    - `oauth.ts`: OAuth flow helper functions.
    - `schemas.ts`: TypeBox schemas for validation.
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
{ code: "VALIDATION", message: "Unprocessable Entity", errors: { email: "Email is invalid" } }
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
