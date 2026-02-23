# ELP — E-Learning Platform

Hệ thống luyện tập lập trình trực tuyến (Online Judge) — a full-stack monorepo for competitive programming with rooms, contests, problems, submissions, and leaderboards.

## Tech Stack

| Layer            | Technology                                                   |
| ---------------- | ------------------------------------------------------------ |
| **Monorepo**     | pnpm workspaces + Turborepo                                  |
| **Backend**      | Express v5, ts-rest, Prisma (PostgreSQL), Redis, JWT         |
| **Frontend**     | React 19, TanStack Router (file-based), TanStack Query, Vite |
| **UI**           | shadcn/ui, Radix UI, Tailwind CSS v4                         |
| **Schemas**      | Zod v4, ts-rest contracts                                    |
| **Code Quality** | Biome (lint + format), Husky (git hooks), TypeScript ~5.9    |
| **API Docs**     | Auto-generated OpenAPI spec from ts-rest contracts            |

## Project Structure

```
elp/
├── apps/
│   ├── backend/          # Express v5 API server
│   ├── frontend/         # React 19 SPA
│   └── open-api/         # OpenAPI documentation generator
├── packages/
│   ├── shared/           # Shared config, constants, utilities
│   └── zod-schemas/      # Zod schemas, entity definitions, API contracts
├── turbo.json            # Turborepo pipeline config
├── biome.json            # Biome linter/formatter config
├── package.json          # Root workspace config
└── .env                  # Environment variables (not committed)
```

## Prerequisites

- **Node.js** >= 22
- **pnpm** >= 10.13.1
- **PostgreSQL** (for backend database)
- **Redis** (for backend caching/session)

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, Redis URL, JWT secret, etc.

# 3. Generate Prisma client
pnpm db:generate

# 4. Run database migrations
pnpm db:migrate:dev

# 5. Seed the database (optional)
pnpm db:reset:force

# 6. Start development servers
pnpm dev
```

## Scripts

### Development

| Command         | Description                       |
| --------------- | --------------------------------- |
| `pnpm dev`      | Run all apps (backend + frontend) |
| `pnpm dev:fe`   | Frontend only                     |
| `pnpm dev:be`   | Backend only                      |
| `pnpm dev:docs` | OpenAPI docs site                 |

### Build & Quality

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `pnpm build`     | Build all apps                        |
| `pnpm lint`      | Run Turborepo lint + Biome lint       |
| `pnpm lint:fix`  | Biome auto-fix lint issues            |
| `pnpm format`    | Biome format all files                |
| `pnpm clean`     | Remove all node_modules, .turbo, dist |

### Database (Prisma)

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm db:generate`     | Regenerate Prisma client |
| `pnpm db:migrate:dev`  | Create/apply migration   |
| `pnpm db:studio:dev`   | Open Prisma Studio       |
| `pnpm db:reset:dev`    | Reset dev database       |
| `pnpm db:reset:force`  | Force reset + seed       |

## Architecture

### Contract-First API (ts-rest)

This template follows a **contract-first** approach using `@ts-rest`:

1. **Define contract** in `packages/zod-schemas/src/api-contract/` — Zod schemas for request/response
2. **Implement router** in `apps/backend/src/routes/` — Express handlers matching the contract
3. **Consume on frontend** — Type-safe API client auto-generated from contracts

This ensures full-stack type safety from database to UI — any contract change is caught at compile time across all apps.

### Key Patterns

- **No `enum` keyword** — Uses `const` objects + derived types (required by `erasableSyntaxOnly`)
- **Response validation** — ts-rest validates response bodies at runtime in development
- **File-based routing** — TanStack Router auto-generates route tree from filesystem
- **Repository pattern** — Frontend wraps API calls in TanStack Query hooks via factory
- **ZodForm system** — Auto-renders forms from Zod schemas with field type markers

## Code Style

Enforced by [Biome](https://biomejs.dev/):

- Single quotes, 2-space indent, 100 char line width
- Auto-organized imports and sorted properties
- No `enum`, no `namespace` (Node 22 native TS strip)

## Critical Library Versions

| Library      | Version          | Notes                         |
| ------------ | ---------------- | ----------------------------- |
| **Zod**      | v4 (`^4.3.5`)    | NOT v3 — breaking API changes |
| **ts-rest**  | v3.53 RC         | Release candidate version     |
| **Express**  | v5 (`^5.2.1`)    | NOT v4                        |
| **React**    | 19 (`^19.2.0`)   | Latest with concurrent features |
| **Tailwind** | v4 (`^4.1.17`)   | CSS-first config              |

## License

MIT
