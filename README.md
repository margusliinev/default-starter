# Default Starter

Project template with my favourite tech stack.

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

API Base URL: `http://localhost:3000/api`
API Docs URL: `http://localhost:3000/api/docs`

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
├── drizzle.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

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

## License

MIT
