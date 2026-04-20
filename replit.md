# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### inline-diagnostics (VS Code Extension)
- Location: `artifacts/inline-diagnostics/`
- Built with: TypeScript + VS Code Extension API
- Output: `artifacts/inline-diagnostics/inline-diagnostics-1.0.0.vsix`
- Features: inline pill diagnostics, background highlights, glyph margin dots, severity-aware color blending
- Build: `cd artifacts/inline-diagnostics && npm install && npm run compile`
- Package: `cd artifacts/inline-diagnostics && npx vsce package --no-yarn --allow-missing-repository`
