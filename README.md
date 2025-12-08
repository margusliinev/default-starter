# Default Starter

A NestJS backend template with authentication, PostgreSQL, and TypeORM.

## Tech Stack

- **NestJS 11** - Backend framework
- **TypeORM** - ORM with migrations
- **PostgreSQL 18** - Database
- **TypeScript** - Language
- **Jest 30** - Testing

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start PostgreSQL (creates db and db_test databases)
docker compose up -d

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Start dev server
npm run dev
```

The API runs at `http://localhost:3000/api`

## Environment Variables

| Variable               | Description                        |
| ---------------------- | ---------------------------------- |
| `PORT`                 | Server port                        |
| `NODE_ENV`             | Server environment                 |
| `COOKIE_SECRET`        | Cookie secret                      |
| `FRONTEND_URL`         | CORS origin                        |
| `DB_HOST`              | Database host                      |
| `DB_PORT`              | Database port                      |
| `DB_NAME`              | Database name                      |
| `DB_USERNAME`          | Database user                      |
| `DB_PASSWORD`          | Database password                  |
| `GOOGLE_CLIENT_ID`     | OAuth client ID                    |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret                |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL                 |
| `GITHUB_CLIENT_ID`     | OAuth client ID                    |
| `GITHUB_CLIENT_SECRET` | OAuth client secret                |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL                 |


## Scripts

| Command                             | Description                      |
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

- **db** - Dev database
- **db_test** - Test database

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

## License

MIT
