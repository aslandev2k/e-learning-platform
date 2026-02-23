# @repo/open-api

Auto-generates OpenAPI documentation from ts-rest API contracts.

## Tech Stack

- **@ts-rest/open-api** v3.53 RC — Extracts OpenAPI spec from ts-rest contracts
- **yaml** — Serializes the spec to YAML format
- **nodemon** — Auto-regenerates docs on file changes during development

## How It Works

This package reads all ts-rest contracts from `@repo/zod-schemas` and generates a complete OpenAPI 3.x specification. The generated spec can be served as a static documentation site or imported into tools like Swagger UI, Redoc, or Postman.

## Project Structure

```
apps/open-api/
├── public/           # Static assets for docs site
├── src/
│   └── open-api.ts   # OpenAPI spec generator script
├── dist/             # Generated output (git-ignored)
├── nodemon.json      # Watch config for dev mode
└── package.json
```

## Scripts

| Command          | Description                                         |
| ---------------- | --------------------------------------------------- |
| `pnpm dev:docs`  | Watch mode — regenerates docs on contract changes   |
| `pnpm openapi`   | One-time generation of OpenAPI spec                 |
| `pnpm clean`     | Remove dist, node_modules, .turbo                   |

## Dependencies

This package depends on:
- `@repo/zod-schemas` — Source of all API contracts used to generate the spec
