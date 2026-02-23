# @repo/zod-schemas

Central source of truth for all data schemas, API contracts, entity definitions, and permission rules.

## Tech Stack

- **Zod v4** (`^4.3.5`) — Schema validation (NOT v3 — breaking API changes)
- **@ts-rest/core** v3.53 RC — Contract-first API definitions

## Structure

```
packages/zod-schemas/
└── src/
    ├── common.ts               # Shared Zod utilities and base schemas
    ├── entity/                 # Entity schemas (database model shapes)
    │   ├── award-schema.ts
    │   ├── council-score-schema.ts
    │   ├── dossier-schema.ts
    │   ├── dossier-history-schema.ts
    │   ├── file-schema.ts
    │   ├── role-schema.ts
    │   ├── unit-schema.ts
    │   └── user-schema.ts
    ├── api-contract/           # ts-rest API contracts
    │   ├── index.ts            # Re-exports all contracts
    │   ├── schemas/            # Request/response schemas per domain
    │   ├── auth.contract.ts
    │   ├── award.contract.ts
    │   ├── council-score.contract.ts
    │   ├── dossier.contract.ts
    │   ├── dossier-history.contract.ts
    │   ├── role.contract.ts
    │   ├── unit.contract.ts
    │   └── user.contract.ts
    ├── api/                    # API-related shared schemas
    ├── form/                   # Form-specific schemas
    ├── openapi/                # OpenAPI metadata extensions
    └── permission/             # Permission and access control definitions
```

## Usage

### Entity Schemas

Define the shape of database entities, used for response typing and validation:

```ts
import { userSchema } from '@repo/zod-schemas/src/entity/user-schema';
```

### API Contracts

Define type-safe API endpoints consumed by both backend and frontend:

```ts
import { awardContract } from '@repo/zod-schemas/src/api-contract/award.contract';
```

### Contract Definition Pattern

Contracts use `initContract()` → `c.router()` with typed method/path/responses:

```ts
const c = initContract();

export const exampleContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/v1/examples',
    query: paginationSchema,
    responses: {
      200: z.object({ data: z.array(exampleSchema) }),
    },
  },
});
```

## Zod v4 Notes

This project uses Zod v4 which has breaking changes from v3:

- `z.string().email()` → `z.email()`
- Error customization API is different
- `z.input` / `z.output` type helpers changed

## Dependencies

This package depends on:
- `@repo/shared` — Shared constants and config values
