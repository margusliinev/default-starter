FROM oven/bun AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install --frozen-lockfile

COPY ./src ./src
COPY ./build.ts ./build.ts

ENV NODE_ENV=production

RUN bun run build

FROM oven/bun

WORKDIR /app

COPY --from=build /app/package.json package.json
COPY --from=build /app/dist/server.js dist/server.js
COPY ./migrations ./migrations

ENV NODE_ENV=production

CMD ["bun", "run", "start"]

EXPOSE 3000
