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
┌── migrations/
├── src/
│   ├── common/
│   ├── database/
│   ├── features/
│   ├── macros/
│   ├── queries/
│   └── index.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
├── build.ts
├── bun.lock
├── compose.yml
├── Dockerfile
├── drizzle.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Folder Guide

| Folder          | Purpose          |
| --------------- | ---------------- |
| `src/common/`   | Shared utilities |
| `src/database/` | Database schemas |
| `src/features/` | Feature modules  |
| `src/macros/`   | Elysia macros    |
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

- **Role**: Entry point, server configuration, feature registration.
- **Contents**:
    - Global middleware registration.
    - Feature modules registration.
    - Graceful shutdown setup.

### 2. Common Utilities (`src/common/`)

- **Role**: Shared resources used across the application.
- **Contents**:
    - `constants.ts`: Global constants.
    - `cookie.ts`: Cookie configuration.
    - `crypto.ts`: Crypto helpers.
    - `enums.ts`: TypeScript enums.
    - `env.ts`: Environment variables.
    - `errors.ts`: Custom error classes.
    - `schemas.ts`: TypeBox schemas for validation.
    - `types.ts`: TypeScript interfaces and types.
    - `index.ts`: Barrel file exporting all common resources.

### 3. Database Layer (`src/database/`)

- **Role**: Database configuration and definition.
- **Contents**:
    - `index.ts`: Drizzle client initialization and migration runner.
    - `schema.ts`: Table definitions using Drizzle ORM.
    - `relations.ts`: Relationship definitions between tables.
- **Conventions**:
    - Use snake_case for database columns.
    - Use UUIDv7 for primary keys.

### 4. Feature Modules (`src/features/`)

- **Role**: Route handlers and business logic grouped by feature.
- **Contents**:
    - `auth.ts`: Authentication routes.
    - `users.ts`: User management routes.
    - `crons.ts`: Scheduled background tasks.
    - `index.ts`: Barrel file exporting all features.
- **Conventions**:
    - Each feature is an Elysia plugin with its own prefix.
    - Use macros for shared functionality.
    - Business logic in route handlers.

### 5. Macros (`src/macros/`)

- **Role**: Reusable Elysia macros for route configuration.
- **Contents**:
    - `auth.ts`: Authentication macro for session validation.
    - `index.ts`: Barrel file exporting all macros.
- **Conventions**:
    - Macros add functionality via `resolve` hooks.
    - Used with `{ auth: true }` in route config.

### 6. Data Access Layer (`src/queries/`)

- **Role**: Pure functions to interact with the database.
- **Contents**:
    - `users.ts`: User-related queries.
    - `accounts.ts`: Account-related queries.
    - `sessions.ts`: Session-related queries.
    - `index.ts`: Barrel file exporting all queries.
- **Conventions**:
    - **No Business Logic**: Only database queries without any extra code.
    - **Datasource**: Optional `datasource` parameter as the last argument for transactions.
    - **Usage**: Imported and used in `src/features/` route handlers.

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
- **Location**: `src/features/crons.ts`.
- **Setup**: Export as Elysia plugin and register in `src/index.ts`.

```typescript
// Cron Job with defined execution time
export const featureCrons = new Elysia({ name: 'feature:crons' }).use(
    cron({
        name: 'cleanup',
        pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
        async run() { ... }
    }),
);
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
2.  **Queries**: Add queries to `src/queries/feature.ts` & make datasource optional last parameter.
3.  **Schemas**: Add schemas to `src/common/schemas.ts` & inferred types to `src/common/types.ts`.
4.  **Feature**: Create feature module at `src/features/feature.ts` with routes and business logic.
5.  **Guards**: Use `macroAuth` in feature & apply `{ auth: true }` for protected routes.
6.  **Register**: Import the feature and register with `.use()` in `src/index.ts`.
7.  **Errors**: Throw errors from `@/common/errors` & let global error handlers deal with them.
8.  **OpenAPI**: Add schemas to route config for Request/Response validation with details.
