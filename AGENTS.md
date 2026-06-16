# AGENTS.md

Automated workspace package release tool (fork of semantic-release). Supports semver + calver, monorepo-aware.

## Monorepo structure

pnpm workspace (`pnpm-workspace.yaml`) with two package groups:

- `libs/*` — internal libraries (versioning, config, semver, calver, conventional-changelog, git-host, testing)
- `plugins/*` — release plugins (npm, pypi, github, gitlab, changelog, commit-analyzer, release-notes-generator, exec)
- Root package (`lets-release`) — the CLI and orchestrator

All packages are ESM (`"type": "module"`). Node >= 22.13.0 required.

## Commands

### Install

```sh
corepack enable
pnpm install
```

### Lint / type-check / build (root)

```sh
pnpm knip                  # dead code detection
pnpm lint                  # eslint --fix (auto-fixes)
pnpm run type-check        # rimraf ./dist && tsc --build
pnpm run build             # rimraf ./dist && tspc --build tsconfig.build.json
```

CI runs in this order: `knip → lint → type-check → test:cov → test:e2e`.

### Tests

Unit tests (colocated as `src/**/*.spec.ts`):

```sh
pnpm test                  # vitest --config ./vitest.unit.config.ts
pnpm test:cov              # same with --coverage.enabled
```

E2E tests (`test/**/*.spec.ts`, requires Docker):

```sh
pnpm test:e2e              # vitest --config ./vitest.e2e.config.ts
```

### Per-package commands

Every lib and plugin has the same script names. Run from the package directory:

```sh
pnpm test                  # unit tests
pnpm test:cov              # unit tests with coverage
pnpm test:e2e              # e2e tests (only packages that have them)
pnpm run type-check        # tsc --build
pnpm run build             # tspc --build tsconfig.build.json
```

Or from root with workspace filters:

```sh
pnpm --recursive --workspace-concurrency=1 run test:cov run
pnpm --filter @lets-release/npm test
```

**`--workspace-concurrency=1`** is used in CI because packages share test infrastructure (Docker containers, temp dirs).

### Run a single test file

```sh
pnpm test -- src/utils/git/getRoot.spec.ts
```

## Build system

**Build uses `tspc` (ts-patch), not plain `tsc`.** The tsconfig.base.json registers three TypeScript compiler plugins:

1. `typescript-transform-paths` — rewrites `src/*` path aliases to relative paths in emitted JS
2. `typescript-transform-paths` (afterDeclarations) — same for `.d.ts` files
3. `@aliser/ts-transformer-append-js-extension` — appends `.js` to emitted ESM imports

Type-checking (`tsc --build`) works without ts-patch. Building (`tspc --build`) requires it.

During development, packages export `./src/*.ts` directly. The `publishConfig` in each package.json overrides exports to `./dist/*.js` at publish time.

## Import conventions

**Cross-package** — always use the workspace package name:

```ts
import { CliOptions } from "@lets-release/config";
```

**Intra-package** — use the `src/` path alias (not relative paths):

```ts
import { getRoot } from "src/utils/git/getRoot";
```

ESLint enforces `import-x/no-relative-parent-imports`. Do not use `../` to cross directories — use `src/` aliases instead.

**Import order** is enforced (eslint `import-x/order`): builtin → external → internal (`@lets-release/*`) → parent (`src/*`, `test/*`) → sibling. Groups separated by blank lines, alphabetized within each group.

## TypeScript

- Strict mode, ESNext target/module, bundler module resolution
- Vitest globals enabled (`describe`, `it`, `expect` available without import)
- Zod **v4** (not v3) — `zod ^4.3.6`

### Zod schema convention

Schemas live in `src/schemas/` directories. Always export both the schema and the inferred type:

```ts
export const FooSchema = z.object({ bar: z.string() });
export type Foo = z.infer<typeof FooSchema>;
```

## Testing conventions

- **Framework**: Vitest with `vi.mock()` and `vi.mocked()` for mocking
- **Unit tests**: colocated next to source as `*.spec.ts`
- **E2E tests**: in `test/` directories with separate vitest configs
- **Coverage**: 100% threshold on root package (see `vite.config.ts` `thresholds`)
- **Shared test utilities**: `@lets-release/testing` provides `createRepo`, `GitBox`, `Verdaccio`, `PyPIServer`

### E2E prerequisites

E2E tests start Docker containers via `globalSetup`:

- **Root e2e** (`test/__global__/setup.ts`): starts GitBox (test git server) and Verdaccio (npm registry)
- **plugins/npm e2e**: starts Verdaccio, installs pnpm/yarn/npm via corepack
- **plugins/pypi e2e**: starts PyPIServer, installs uv and poetry into a temp dir

Requirements: **Docker daemon running**, corepack available, Python for PyPI tests. E2E timeouts are long (up to 240s per test).

## Commits and hooks

- **Conventional commits** enforced by commitlint (`@commitlint/config-conventional`), max body line length 256
- **Pre-commit hook** (husky): `lint-staged` runs prettier + eslint on staged `*.ts` files
- **Commit-msg hook** (husky): `commitlint --edit`

## Release

The repo dogfoods itself (see `release.config.ts`). Release branches: `main`, `next`, `*.x`. CI builds with `tspc`, then runs `pnpm vite-node src/cli.ts` to release all packages.

## Formatting

- 2 spaces, LF line endings, UTF-8 (`.editorconfig`)
- Prettier for formatting, ESLint for linting (eslint-plugin-prettier bridges them)
