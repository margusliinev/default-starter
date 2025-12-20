# NestJS Backend Conventions

## Critical Implementation Guidelines

1. **No Any Types**: Strictly forbidden. Use `unknown` or specific types.
2. **No Explicit Return Types**: Omit unless absolutely necessary for clarity.
3. **No default exports**: Always use named exports, use default only if needed.
4. **Concise Comments**: Only where logic is complex or not obvious, keep short.
5. **Communication**: Be extremely concise and give answers like an engineer.

## Naming Conventions

1. **Files**: Kebab-case (`user-profile.service.ts`)
2. **Classes**: PascalCase (`UserProfileService`)
3. **Interfaces/Types**: PascalCase (`OAuthUserInfo`)
4. **Variables/Functions**: CamelCase (`findUserById`)
5. **Database Columns**: Snake_case (`email_verified_at`)
6. **Constants**: UPPERCASE_WITH_UNDERSCORES (`ARGON2_OPTIONS`)
7. **Enums**: PascalCase (`Environment`)

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
├── compose.yml
├── nest-cli.json
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

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

## Docker

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

## Creating a New Feature

1. Create `src/features/{name}/` directory
2. Define entity in `entities/`
3. Create DTOs in `dto/`
4. Implement service in `{name}.service.ts`
5. Create controller in `{name}.controller.ts`
6. Define module in `{name}.module.ts`
7. Import module in `app.module.ts`
8. Create migration if needed
9. Add tests in `tests/`
