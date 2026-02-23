# @repo/backend

Express v5 API server with contract-first type safety via ts-rest.

## Tech Stack

- **Express v5** — HTTP server
- **ts-rest** v3.53 RC — Contract-first API routing with runtime response validation
- **Prisma** v7 — ORM with PostgreSQL via `@prisma/adapter-pg` driver adapter
- **Redis** (ioredis) — Caching and session management
- **JWT** (jsonwebtoken) — Authentication with access/refresh tokens
- **bcryptjs** — Password hashing
- **Winston** — Structured logging
- **LRU Cache** — In-memory caching layer

## Project Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Prisma migrations
│   └── seed.ts             # Database seeder
├── src/
│   ├── main.ts             # App entry point — registers all endpoints
│   ├── routes/             # ts-rest router handlers
│   │   ├── auth.router.ts
│   │   ├── award.router.ts
│   │   ├── council-score.router.ts
│   │   ├── dossier.router.ts
│   │   ├── dossier-history.router.ts
│   │   ├── roles.router.ts
│   │   ├── units.router.ts
│   │   └── users.router.ts
│   ├── middlewares/        # Express middleware (auth, error handling, validation)
│   ├── services/           # Business logic services
│   ├── utils/              # Logger, helpers
│   └── generated/          # Prisma generated client (git-ignored)
└── tsconfig.json
```

## Scripts

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `pnpm dev`             | Start dev server with hot-reload (`tsx watch`)   |
| `pnpm db:generate`     | Regenerate Prisma client                         |
| `pnpm db:migrate:dev`  | Create and apply a new migration                 |
| `pnpm db:studio:dev`   | Open Prisma Studio GUI                           |
| `pnpm db:seed`         | Run database seeder                              |
| `pnpm db:reset:dev`    | Reset database (force)                           |
| `pnpm db:reset:force`  | Generate + push schema + seed                    |

## Key Patterns

### Router Registration

Each router file exports a `createXxxEndpoint(app)` function that is called in `main.ts`:

```ts
// routes/award.router.ts
export function createAwardEndpoint(app: Express) {
  const s = initServer();
  createExpressEndpoints(awardContract, s.router(awardContract, { ... }), app, routerDefaultOptions());
}
```

### Authentication

Routes requiring auth include `jwtAuthHeaderSchema` in their contract's `headers` field. The middleware auto-detects this via `HEADER_AUTH_DESCRIPTION` and applies JWT verification.

### Response Format

All handlers return typed responses with `as const` status codes:

```ts
return { status: 200 as const, body: { data: result } };
```

### TypeScript Config

- `erasableSyntaxOnly: true` — No `enum`, `namespace`, or parameter decorators
- Prisma client generated to `src/generated/prisma`

## Dependencies

This package depends on:
- `@repo/shared` — App config, constants, time utilities
- `@repo/zod-schemas` — Zod schemas and ts-rest API contracts
