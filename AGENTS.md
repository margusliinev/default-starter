# Copilot Instructions

## Critical Implementation Guidelines

1. **No Any Types**: Strictly forbidden. Use `unknown` or specific types.
2. **No Explicit Return Types**: Omit unless absolutely necessary for clarity.
3. **No Default Exports**: Always use named exports, use default only if needed.
4. **Concise Comments**: Only where logic is complex or not obvious, keep short.

## Naming Conventions

| Category            | Convention                 | Example               |
| ------------------- | -------------------------- | --------------------- |
| Folders/Files       | camelCase                  | `createUser.ts`       |
| Variables/Functions | camelCase                  | `updateSession`       |
| Schemas             | PascalCase                 | `RegisterBody`        |
| Types               | PascalCase                 | `GithubUser`          |
| Enums               | PascalCase                 | `Provider`            |
| Database Columns    | snake_case                 | `created_at`          |
| Constants           | UPPERCASE_WITH_UNDERSCORES | `SESSION_DURATION_MS` |

## Tech Stack

| Category   | Technology          |
| ---------- | ------------------- |
| Runtime    | Bun                 |
| Framework  | Elysia              |
| Language   | TypeScript          |
| Database   | PostgreSQL 18       |
| ORM        | Drizzle ORM         |
| Migrations | Drizzle Kit         |
| Validation | TypeBox             |
| Auth       | Credentials + OAuth |
| Scheduling | @elysiajs/cron      |
| API Docs   | @elysiajs/openapi   |

## Project Structure

```
├── migrations/
├── src/
│   ├── config/
│   ├── db/
│   ├── lib/
│   ├── macros/
│   ├── plugins/
│   ├── queries/
│   ├── routes/
│   ├── schemas/
│   └── server.ts
├── build.ts
├── compose.yml
├── Dockerfile
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

### Folder Guide

| Folder         | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `src/config/`  | Configuration files                                |
| `src/db/`      | Database connection, schema, migrations, relations |
| `src/lib/`     | Shared utilities (cookie, crypto, errors, oauth)   |
| `src/macros/`  | Elysia macros for route-level logic                |
| `src/plugins/` | Elysia plugins for app-level features              |
| `src/queries/` | Database access functions                          |
| `src/routes/`  | API route handlers                                 |
| `src/schemas/` | TypeBox validation schemas                         |

## Patterns

### Routes

- Define routes in `src/routes/` and register in `src/server.ts`
- Use authMacro to protect routes and load session & user to context
- Use functions from queries to talk to the database, never directly
- Use typebox schemas for request validation

```typescript
// src/routes/example.ts
export const exampleRoutes = new Elysia({ prefix: '/example' }).use(authMacro).post('/', handler, {
    auth: true,
    body: BodySchema,
    response: { 200: ResponseSchema, 500: ErrorResponse },
    detail: { tags: ['Example'] },
});
```

### Queries

- Contains functions to access the database
- Always include transaction as last optional parameter
- Always return Drizzle query results directly
- Never add any logic these functions, just database query

```typescript
// src/queries/example.ts
import { db, type Datasource } from '@/db';

export function createItem(data: CreateItem, datasource: Datasource = db) {
    return datasource.insert(itemTable).values(data).returning();
}

// Usage in transaction
await db.transaction(async (tx) => {
    await createItem(data, tx);
});
```

### Schemas

- Use TypeBox via Elysia's `t` helper
- Define request body, query, and response schemas
- Include descriptive error messages

```typescript
// src/schemas/example.ts
import { t } from 'elysia';

export const CreateExampleBody = t.Object({
    name: t.String({ minLength: 1, error: 'Name is required' }),
    email: t.String({ format: 'email', error: 'Invalid email' }),
});
```

### Database Schema

- Define tables in `src/db/schema.ts`
- Define relations in `src/db/relations.ts`
- Use UUIDv7 for primary keys
- Use snake_case for column names
- Export TypeBox schemas via `drizzle-typebox`
- Export Types inferred from `drizzle-typebox` schemas

```typescript
// src/db/schema.ts
export const exampleTable = pgTable('example', {
    id: uuid()
        .primaryKey()
        .default(sql`uuidv7()`),
    name: text().notNull(),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
});

export const exampleSelectSchema = createSelectSchema(exampleTable);
export const exampleInsertSchema = createInsertSchema(exampleTable);
export const exampleUpdateSchema = createUpdateSchema(exampleTable);

export type Example = Static<typeof exampleSelectSchema>;
export type CreateExample = Static<typeof exampleInsertSchema>;
export type UpdateExample = Static<typeof exampleUpdateSchema>;
```

## Global Setup

### Bootstrap (`server.ts`)

- **Prefix**: `/api`
- **Cookie**: Signed HTTP-only cookies with secure flag in production
- **Error Handling**: Global error handler via `.onError()`
- **Lifecycle**: Auto-migrate on start, close DB connection on stop
- **Graceful Shutdown**: SIGINT/SIGTERM handlers

### Response Format

- **Success**: Data returned directly from handlers`
- **Error**: `{ code: '...', message: '...', errors?: {...} }`

## Authentication

- **Session-based**: Signed HTTP-only cookie (`session`)
- **Session duration**: 30 days, auto-renews within 15 days of expiry
- **OAuth**: Google/GitHub with state cookie for CSRF protection
- **Auth Macro**: Validates session on routes with `{ auth: true }`
- **Password Hashing**: Argon2id via `Bun.password`

### Using Auth Macro

```typescript
export const protectedRoutes = new Elysia({ prefix: '/protected' }).use(authMacro).get(
    '/data',
    ({ user, session }) => {
        return { userId: user.id, sessionId: session.id };
    },
    { auth: true },
);
```

## Error Handling

Throw typed errors from `src/lib/errors.ts`. The global error handler formats them.

```typescript
import { NotFoundError, ConflictError } from '@/lib/errors';

throw new NotFoundError();
throw new ConflictError({ email: 'Exists' });
```

### Available Errors

| Error                  | Status |
| ---------------------- | ------ |
| `BadRequestError`      | 400    |
| `UnauthorizedError`    | 401    |
| `ForbiddenError`       | 403    |
| `NotFoundError`        | 404    |
| `ConflictError`        | 409    |
| `ValidationError`      | 422    |
| `TooManyRequestsError` | 429    |
| `InternalServerError`  | 500    |

## Environment Variables

Required in `.env` (see `.env.example`):

| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `PORT`                 | Server port                  |
| `NODE_ENV`             | development / production     |
| `DATABASE_URL`         | PostgreSQL connection string |
| `FRONTEND_URL`         | CORS origin for frontend     |
| `SESSION_SECRET`       | Min 32 chars for cookies     |
| `GOOGLE_CLIENT_ID`     | OAuth client ID              |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret          |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL           |
| `GITHUB_CLIENT_ID`     | OAuth client ID              |
| `GITHUB_CLIENT_SECRET` | OAuth client secret          |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL           |

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

## Docker

Single PostgreSQL container for development:

- **Port**: `5432`
- **Host**: `localhost`
- **Database**: `db`
- **User**: `user`
- **Password**: `password`

## Creating a New Feature

1. Define database table in `src/db/schema.ts`
2. Add relations in `src/db/relations.ts`
3. Create query functions in `src/queries/{feature}.ts`
4. Define validation schemas in `src/schemas/{feature}.ts`
5. Create routes in `src/routes/{feature}.ts`
6. Register routes in `src/server.ts`
7. Generate migrations: `bun run db:generate`
