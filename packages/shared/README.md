# @repo/shared

Shared utilities, constants, and configuration used across all apps in the monorepo.

## Structure

```
packages/shared/
└── src/
    ├── app-config.ts     # Application-wide configuration constants
    ├── common/           # Shared constants and common values
    └── utils/            # Utility functions (time helpers, etc.)
```

## Usage

Import from any app or package in the monorepo:

```ts
import { APP_CONFIG } from '@repo/shared/src/app-config';
import { formatTime } from '@repo/shared/src/common/time.utils';
```

## What Belongs Here

- Application configuration constants shared across backend and frontend
- Common utility functions (time formatting, value converters)
- Shared type definitions and constants

## What Does NOT Belong Here

- Zod schemas and API contracts (use `@repo/zod-schemas` instead)
- UI components or backend-specific logic
