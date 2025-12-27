# Backend Conventions

## Critical Implementation Guidelines

1. **No Explicit Return Types**: Omit unless absolutely necessary for clarity.
2. **No Default Exports**: Always use named exports, use default only if needed.
3. **No Any Types**: Strictly forbidden. Use `unknown` or specific types.
4. **No Comments**: Add comments only when logic is complex or not obvious.
5. **No CommonJS**: Write modern JavaScript/Typescript, using native ES modules.

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
│   ├── crons/
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
├── package.json
├── README.md
└── tsconfig.json
```

## Folder Guide

| Folder          | Purpose          |
| --------------- | ---------------- |
| `src/common/`   | Shared utilities |
| `src/crons/`    | Scheduled tasks  |
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

Entry point that configures the Elysia server, registers global middleware, feature modules, cron jobs, and handles graceful shutdown.

### 2. Common Utilities (`src/common/`)

Shared resources used across the application:

| File           | Purpose                         |
| -------------- | ------------------------------- |
| `constants.ts` | Application-wide constants      |
| `cookie.ts`    | Cookie configuration            |
| `crypto.ts`    | Hashing and token generation    |
| `enums.ts`     | Shared enumerations             |
| `env.ts`       | Environment variable validation |
| `errors.ts`    | Custom error classes            |
| `schemas.ts`   | TypeBox schemas for validation  |
| `types.ts`     | Shared TypeScript types         |

**Environment Variables:**

```typescript
import { env } from '@/common/env';
env.PORT;
env.NODE_ENV;
env.DATABASE_URL;
```

**Error Handling:**

Throw typed errors from `@/common/errors`. Global handler catches and formats the response.

```typescript
import { NotFoundError, UnauthorizedError } from '@/common/errors';
throw new NotFoundError();
throw new UnauthorizedError();
```

**Response Format:**

```typescript
// Success - data returned directly
{ id: 1, name: 'Alice', email: 'alice@gmail.com', image: null }

// Error - handled globally
{ code: "CONFLICT", message: "Conflict", errors: { email: "Email is already in use" } }
```

**Validation Schemas:**

Define TypeBox schemas in `src/common/schemas.ts` and use in route config.

```typescript
export const UserSchema = t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String({ format: 'email' }),
});

// Usage in routes
.post('/users', handler, { body: UserSchema })
.get('/users/:id', handler, { response: { 200: UserSchema } })
```

### 3. Cron Jobs (`src/crons/`)

Scheduled tasks using `@elysiajs/cron`. Export as Elysia plugin and register in `src/index.ts`.

```typescript
export const cronjobs = new Elysia({ name: 'crons' }).use(
    cron({
        name: 'cleanup',
        pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
        async run() { ... }
    }),
);
```

### 4. Database Layer (`src/database/`)

Drizzle ORM configuration, table definitions in `schema.ts`, and relationships in `relations.ts`. Use snake_case for columns and UUIDv7 for primary keys.

```typescript
export const users = pgTable('users', {
    id: uuid().primaryKey(),
    name: text().notNull(),
    email: text().notNull().unique(),
    created_at: timestamp().defaultNow().notNull(),
});
```

**Migration Workflow:**

1. Add/update schema in `src/database/schema.ts`
2. Add/update relations in `src/database/relations.ts`
3. Run `bun run db:generate` to create SQL migration files
4. Run `bun run db:migrate` to apply migrations

### 5. Feature Modules (`src/features/`)

Route handlers and business logic grouped by feature. Each feature folder can contain:

| File             | Purpose                    |
| ---------------- | -------------------------- |
| `*.routes.ts`    | Route handlers             |
| `*.service.ts`   | Business logic             |
| `*.constants.ts` | Feature specific constants |
| `*.schemas.ts`   | Feature specific schemas   |
| `*.types.ts`     | Feature specific types     |

**Routes File Rules:**

- Handles cookies (setting/clearing)
- Sends final response (return ...)
- Sets status (set.status = 201, default is 200)
- Defines schemas (body, params, query, response, detail)
- Calls service functions and handles their return values

```typescript
export const usersRoutes = new Elysia({ name: 'route:users', prefix: '/users' })
    .guard({ as: 'scoped', cookie })
    .use(authMacro)
    .patch(
        '/me',
        async ({ user, body }) => {
            return await updateCurrentUser(user.id, body);
        },
        {
            auth: true,
            body: userUpdateSchema,
            response: { 200: userSelectSchema, 401: ErrorSchema, 422: ErrorSchema, 500: ErrorSchema },
            detail: { tags: [OpenApiTag.USERS], summary: 'Update me', description: 'Updates the current user.' },
        },
    );
```

**Service File Rules:**

- Contains business logic
- Never touches cookies
- Never sends responses directly
- Can import `db` ONLY to start transactions
- All database operations imported from `queries`

```typescript
async function login(params: Login) {
    const normalizedEmail = params.email.toLowerCase().trim();

    const [user] = await findUserByEmail(normalizedEmail);
    if (!user) throw new UnauthorizedError();

    const [account] = await findCredentialsAccount(user.id);
    if (!account || !account.password) throw new UnauthorizedError();

    const isValidPassword = await verifyPassword(params.password, account.password);
    if (!isValidPassword) throw new UnauthorizedError();

    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION.DURATION_IN_MS);
    const session = { user_id: user.id, token: hashedToken, expires_at: expiresAt };

    await createSession(session);

    return { token, expiresAt };
}
```

### 6. Macros (`src/macros/`)

Reusable Elysia macros. The `authMacro` validates sessions and provides `user` and `session` in route context.

```typescript
.use(authMacro)
.get('/public', () => 'anyone can access')
.get('/protected', ({ user }) => user, { auth: true })
```

### 7. Data Access Layer (`src/queries/`)

Pure database query functions with no business logic. All functions accept an optional `datasource` parameter as the last argument for transaction support.

```typescript
export function findUserByEmail(email: string, datasource: Datasource = db) {
    return datasource.select().from(schema.userTable).where(eq(schema.userTable.email, email));
}

export function insertUser(data: NewUser, datasource: Datasource = db) {
    return datasource.insert(schema.userTable).values(data).returning();
}
```

### 8. Adding a New Feature

1. **Database**: Add tables to `src/database/schema.ts` & relations to `src/database/relations.ts`
2. **Queries**: Add queries to `src/queries/feature.ts` with optional `datasource` parameter
3. **Schemas**: Add schemas to `src/common/schemas.ts` & inferred types to `src/common/types.ts`
4. **Routes**: Create `src/features/{feature}/{feature}.routes.ts` with route handlers
5. **Service**: Create `src/features/{feature}/{feature}.service.ts` with business logic
6. **Guards**: Utilize `authMacro` by configuring `{ auth: true }` for protected routes
7. **Register**: Export routes from `src/features/index.ts` and register in `src/index.ts`
8. **Errors**: Throw errors from `@/common/errors` when needed, avoid swallowing errors.
9. **OpenAPI**: Add schemas to route config for documentation with appropriate status.
