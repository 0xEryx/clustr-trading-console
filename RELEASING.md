# Releasing Clustr Trading Console

Clustr uses one public npm package for macOS, Windows, and Linux. A release is immutable: source changes require a new semantic version and never replace an existing tarball.

## First publication

1. Create the public GitHub repository that will own the package.
2. Add the exact `repository`, `bugs`, and `homepage` URLs to `package.json`. The repository URL must match the GitHub repository used by npm Trusted Publishing.
3. Run `pnpm install` and commit `pnpm-lock.yaml`.
4. Run `pnpm run release:check` and review every file printed by `npm pack --dry-run`.
5. Generate a tarball with `npm pack`, install it into an isolated DSH home, and verify the Console, preset selection, read-only startup, vault refusal paths, and uninstall restoration.
6. Publish the first version from an npm account protected by 2FA with `npm publish --access public`, or use npm staged publishing and approve it with 2FA.
7. On npmjs.com, configure `release.yml` as the GitHub Actions Trusted Publisher for `@clustrai/trading-console`. Require approval on the `npm-release` GitHub environment.
8. After Trusted Publishing works, revoke any long-lived automation publish token.

## Normal release

1. Update `CHANGELOG.md` and bump the same semantic version in `package.json` and `src/version.js`.
2. Run `pnpm run release:check` locally.
3. Commit the release, create an annotated tag such as `v0.3.1`, and push the tag.
4. The release workflow verifies the common package on macOS, Windows, and Linux before the OIDC-authenticated publish job can run.
5. Verify the npm provenance record, install the published exact version in a clean DSH profile, and attach the tarball checksum to the GitHub Release.

## Release rules

- Never publish from the live package directory under `~/.dsh`.
- Never publish from a dirty working tree.
- Never include API credentials, credential indexes, audit data, `.env` files, source maps, QA captures, or machine-specific paths.
- Never use `preinstall`, `install`, `postinstall`, or `prepare` to mutate a user's machine. Preset setup is an explicit `clustr-console setup` action.
- Never update while an order is submitting, unknown, or reconciling. Runtime auto-update belongs behind a separately reviewed safe-window state machine.
- A release that fails its health check must be rolled back by installing the previous exact npm version; an existing npm version is never republished.
