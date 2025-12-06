# Default Starter

A NestJS backend template with authentication, PostgreSQL, and TypeORM.

## Tech Stack

- **NestJS 11** - Backend framework
- **PostgreSQL** - Database
- **TypeORM** - ORM with migrations
- **TypeScript** - Language
- **Jest** - Testing

## Quick Start

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Start dev server
npm run dev
```

The API runs at `http://localhost:3000/api`

## Scripts

| Command                             | Description          |
| ----------------------------------- | -------------------- |
| `npm run dev`                       | Start dev server     |
| `npm run build`                     | Build for production |
| `npm run start`                     | Run production build |
| `npm run test`                      | Run tests            |
| `npm run format`                    | Format with Prettier |
| `npm run cli db:seed`               | Seed test user       |
| `npm run migration:create --name=X` | Create migration     |
| `npm run migration:run`             | Run migrations       |

## Project Structure

```
src/
├── cli/       # CLI commands
├── common/    # Shared utilities
├── crons/     # Scheduled tasks
└── features/  # Feature modules
```

## License

MIT
