# Default Starter

Project template with my favourite tech stack.

## Tech Stack

- **Bun** - Runtime
- **Elysia** - Framework
- **TypeScript** - Language
- **PostgreSQL 18** - Database
- **Drizzle ORM** - ORM
- **Drizzle KIT** - Migrations
- **Typebox** - Validation

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Install dependencies
bun install

# Start dev server
bun run dev
```

The API runs at `http://localhost:3000/api`
API docs available at `http://localhost:3000/api/docs`

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

## Docker

Single PostgreSQL container with two databases:

- **Port**: `5432`
- **Host**: `localhost`
- **Database**: `db`
- **Username**: `user`
- **Password**: `password`

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

## License

MIT
