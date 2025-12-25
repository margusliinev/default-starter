# Default Starter

Project template using my favourite technologies.

## Tech Stack

- **Bun** - Runtime
- **Elysia** - Web framework
- **Drizzle ORM** - Database
- **Drizzle KIT** - Migrations
- **PostgreSQL 18** - Database
- **TypeScript** - Language

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Install dependencies
bun install

# Start dev server
bun dev
```

The API runs at `http://localhost:3000/api`

API docs available at `http://localhost:3000/api/docs`

## Environment Variables

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

## License

MIT
