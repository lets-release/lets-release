# Copilot Instructions for lets-release

## Project Overview

**lets-release** is a semantic/calendar versioning automation tool (fork of semantic-release) with monorepo support. It analyzes commit messages, determines release types, generates changelogs, and publishes packages automatically.

### Key Architecture Concepts

**Plugin System**: Core workflow is entirely plugin-driven with these steps:

- `findPackages` → `verifyConditions` → `analyzeCommits` → `verifyRelease` → `generateNotes` → `addChannels` → `prepare` → `publish` → `success`/`fail`
- Each plugin implements interfaces from `libs/config/src/types/*Context.ts`
- Plugins are in `plugins/` directory with standardized structure: `src/steps/`, `src/types/`, `src/schemas/`

**Monorepo Structure**:

- `libs/`: Core libraries (config, semver, calver, git-host, etc.)
- `plugins/`: Release plugins (npm, github, gitlab, changelog, etc.)
- `src/`: Main orchestration engine (`LetsRelease.ts` is the core)
- Each workspace package has its own `package.json` with unified tooling

**Dependency Resolution**: Uses topological sorting for package release order based on `package.dependencies` in plugin results.

## Critical Developer Workflows

### Testing

```bash
# Unit tests for specific workspace
pnpm test --filter @lets-release/npm

# All unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

### Building

```bash
# Type checking
pnpm type-check

# Build all packages
pnpm build

# Lint and fix
pnpm lint
```

### Plugin Development

Create plugin in `plugins/new-plugin/` with:

- `src/index.ts` - Export step functions and schemas
- `src/steps/` - Implement step interfaces (verifyConditions, publish, etc.)
- `src/types/` - Plugin-specific context types
- `src/schemas/` - Zod validation schemas
- Follow existing plugins like `plugins/npm/` or `plugins/github/`

## Project-Specific Conventions

### TypeScript Patterns

- **Path mapping**: Use `src/` imports, not relative paths (`src/utils/git/addTag` not `../../utils/git/addTag`)
- **Context typing**: Step functions receive `NormalizedStepContext<Step.stepName>` with plugin state management
- **Error handling**: Use `extractErrors()` to unwrap AggregateError chains
- **Async workflows**: `runRecursiveWorkflows` handles dependency resolution automatically

### Configuration System

- Options defined in `libs/config/src/schemas/Options.ts` (Zod schema)
- Uses cosmiconfig for loading (.letsreleaserc, package.json, etc.)
- Branch config supports glob patterns for maintenance/prerelease branches
- Package options support per-package plugin overrides

### Git Operations

- All git operations in `src/utils/git/` with consistent `{ cwd, env }` context
- Tags follow `${uniqueName}${refSeparator}v${version}` pattern (configurable)
- Authentication via environment variables (GH_TOKEN, GL_TOKEN, etc.)

### Version Resolution

- **SemVer**: `libs/semver/` - Standard semantic versioning
- **CalVer**: `libs/calver/` - Calendar versioning with configurable patterns
- **Release types**: `patch` → `minor` → `major` → `premajor` etc. (see `RELEASE_TYPES`)

## Key Integration Points

### Plugin State Management

```typescript
// In plugin steps, use context helpers:
context.getPluginPackageContext<T>(pluginName, packageType, packageName);
context.setPluginPackageContext<T>(pluginName, packageType, packageName, value);
```

### Cross-Package Dependencies

- Defined in `FindPackagesResult.dependencies` array
- `releaseFollowingDependencies: true` bumps dependent packages when dependencies release
- Release order determined by topological sort in `runRecursiveWorkflows`

### External Services

- **GitHub/GitLab**: Authentication, release creation, issue commenting
- **npm**: Registry publishing, OIDC token exchange, provenance
- **PyPI**: Trusted publishing support

### Testing Infrastructure

- **Vitest**: Unit and E2E testing with workspace support
- **@lets-release/testing**: Shared test utilities and fixtures
- **Coverage**: V8 coverage collection across all packages
- **E2E**: Real git repository testing in `test/__fixtures__/`

## Common Debugging Patterns

- Enable debug logging: `DEBUG=lets-release:* pnpm test`
- Plugin errors include `pkg` context for easier troubleshooting
- Use `dryRun: true` to test without actual publishing
- Check `context.ciEnv` for CI environment detection issues
