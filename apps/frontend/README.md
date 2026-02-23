# @repo/frontend

React 19 SPA with file-based routing, type-safe API consumption, and a comprehensive UI component system.

## Tech Stack

- **React 19** — UI library with concurrent features
- **Vite** v7 — Build tool and dev server
- **TanStack Router** — File-based routing with auto code-splitting
- **TanStack Query** — Server state management and data fetching
- **TanStack Table** — Headless table with sorting, filtering, pagination
- **shadcn/ui** + **Radix UI** — Accessible component primitives
- **Tailwind CSS v4** — Utility-first CSS with CSS-first config
- **React Hook Form** + **@hookform/resolvers** — Form management with Zod validation
- **Recharts** — Data visualization / charting
- **Sonner** — Toast notifications

## Project Structure

```
apps/frontend/
├── public/                     # Static assets (icons, images)
├── src/
│   ├── @type/                  # Global TypeScript declarations
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── common/             # Shared app components
│   │   ├── global/             # Global modals (AlertDialog, PreviewFile, etc.)
│   │   ├── page-status/        # 403, 404, error pages
│   │   ├── zod-form/           # Auto-form system from Zod schemas
│   │   └── ...                 # Standalone components
│   ├── config/                 # App config, API client setup
│   ├── contexts/               # React context providers
│   ├── css/                    # Global styles (main.css, theme.css, custom.css)
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities (cookie, logger, event-bus, URL manager)
│   ├── repositories/           # TanStack Query wrappers (repository pattern)
│   ├── routes/                 # File-based routes (TanStack Router)
│   │   ├── __root.tsx          # Root layout
│   │   ├── -layout/            # Shared layout components (ignored by router)
│   │   ├── app/                # Authenticated app routes
│   │   └── auth/               # Authentication routes
│   └── utils/                  # Helper functions
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
└── tailwind.config.ts          # Tailwind CSS config
```

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `pnpm dev`      | Start Vite dev server with HMR        |
| `pnpm build`    | Production build                      |
| `pnpm preview`  | Preview production build locally      |
| `pnpm lint`     | TypeScript type checking (`tsc -b`)   |
| `pnpm clean`    | Remove node_modules, .turbo, .tanstack|

## Key Patterns

### File-Based Routing

TanStack Router auto-generates `routeTree.gen.ts` from the `src/routes/` filesystem. Files/folders prefixed with `-` (e.g., `-components/`, `-layout/`, `-factory.ts`) are ignored by the router.

### Repository Pattern

API calls are wrapped in TanStack Query hooks using the `createQueryRepository` factory in `src/repositories/`:

```ts
const awardRepo = createQueryRepository(clientAPI.Award);
// Provides: useQuery, loader, invalidate, updateCache
```

### ZodForm System

The `src/components/zod-form/` system auto-renders form fields from Zod schemas. Field types are determined by `SCHEMA_DESCRIPTION` markers in the schema (e.g., `DATETIME`, `TEXTAREA`, `UPLOAD_FILES`).

### Global Modals

Global modal components (`ZodFormDialog`, `ZodFormDrawer`, `GlobalAlertDialog`, `GlobalPreviewFile`) are mounted at the root layout and controlled via an event bus pattern.

### Authentication

JWT tokens are stored in cookies via `js-cookie`. On 401 responses, the app auto-redirects to `/auth/sign-out`.

### Path Aliases

`@/*` maps to `./src/*` for clean imports.

## Dependencies

This package depends on:
- `@repo/shared` — App config, constants
- `@repo/zod-schemas` — Zod schemas and API contracts for type-safe API calls
