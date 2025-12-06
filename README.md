# Default Starter

Default Starter is a template for new projects built with my preferred stack.

## Tech Stack

- **TypeScript**
- **NestJS**
- **React**
- **Vite**

## Local Development

```bash
# Start PostgreSQL
docker compose up -d

# Copy Environment Variables
cp .env.example .env

# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development mode
npm run dev

# Build the project
npm run build

# Start production mode
npm run start
```

## Useful Scripts:

```bash
# Run Formatting
npm run format

# Run Tests
npm run test
```

## License

MIT
