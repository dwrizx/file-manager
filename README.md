# File Manager (Bun + React)

A fast file manager web app built with Bun, React, and Tailwind, with strict and fast quality tooling (`tsgo`, `oxlint`, `oxfmt`).

## Requirements

- Bun (recommended: latest stable)

## Quick Start

Install dependencies:

```bash
bun install
```

Run development server:

```bash
bun run dev
```

Run production server:

```bash
bun run start
```

Build production assets:

```bash
bun run build
```

## Scripts

- `bun run dev`: Start dev server (`src/index.ts`)
- `bun run start`: Start production mode server
- `bun run build`: Build frontend assets into `dist/`
- `bun run typecheck`: Type-check with `tsgo` (`tsconfig.typecheck.json`)
- `bun run lint`: Lint with `oxlint`
- `bun run lint:fix`: Auto-fix lint issues
- `bun run fmt`: Format with `oxfmt`
- `bun run fmt:check`: Check formatting without writing changes
- `bun run check:fast`: Run lint + format check
- `bun run check`: Run typecheck + lint + format check
- `bun run fix`: Run lint autofix + formatter

## Quality Workflow

Recommended local workflow before pushing:

1. `bun run check:fast` while iterating
2. `bun run check` before commit/push
3. If failing, run `bun run fix` and re-check

## CI

GitHub Actions workflow at `.github/workflows/quality.yml` runs:

1. `bun install --frozen-lockfile`
2. `bun run check`

If CI is red, the change is not ready to merge.
