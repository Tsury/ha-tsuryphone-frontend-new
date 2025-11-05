# GitHub Actions Workflows - Quick Reference

## Workflows Created

### 1. Auto Release on Push (`auto-release-on-push.yml`)

**Trigger**: Automatically on every push to `main` branch

**What it does**:

1. Reads current version from `package.json`
2. Auto-bumps patch version (e.g., 0.1.0-alpha → 0.1.1-alpha)
3. Installs dependencies with `npm ci`
4. Builds the frontend bundle (`npm run build`)
5. Commits the version bump back to main
6. Creates a Git tag (e.g., `v0.1.1-alpha`)
7. Creates a GitHub Release with:
   - Complete zip package (`tsuryphone-card-X.X.X-alpha.zip`)
   - SHA256 checksum
   - Standalone bundle (`tsuryphone-card.js`)
   - Source map

**Skip release**: Include `[skip-release]` in commit message

**Example**:

```bash
git commit -m "fix: some bug [skip-release]"
```

---

### 2. HACS Validation (`hacs-validation.yml`)

**Trigger**: On push, pull requests, or manual dispatch

**What it does**:

1. Validates `hacs.json` is valid JSON with required fields
2. Checks for `info.md` and `README.md`
3. Verifies build artifact path exists (if built)

**Required fields in hacs.json**:

- `name`
- `filename`

---

### 3. CI Build Validation (`ci.yml`)

**Trigger**: On push, pull requests, or manual dispatch

**What it does**:

1. Sets up Node.js 20
2. Installs dependencies (`npm ci`)
3. Runs TypeScript compiler (`tsc --noEmit`)
4. Runs linter (`npm run lint` - non-blocking)
5. Builds bundle (`npm run build`)
6. Verifies output exists
7. Uploads build artifact (retained for 7 days)
8. Warns if bundle > 1MB

---

## Workflow Behavior

### Auto-versioning Strategy

The auto-release workflow uses **patch version bumping**:

- `0.1.0-alpha` → `0.1.1-alpha` → `0.1.2-alpha`

The suffix (e.g., `-alpha`) is preserved during auto-bumping.

### Manual Release (if needed)

To create a release with a specific version:

```bash
# Update package.json version manually
npm version 0.2.0-alpha --no-git-tag-version

# Commit and push
git add package.json package-lock.json
git commit -m "chore: bump version to 0.2.0-alpha"
git push

# Auto-release will trigger and create v0.2.1-alpha
# (it auto-bumps, so you'd get 0.2.1 not 0.2.0)
```

**To prevent auto-bump**, use `[skip-release]` in commit message.

### Skipping Workflows

- **Skip auto-release**: Include `[skip-release]` or `chore(auto-release)` in commit message
- **Skip CI**: Not possible, but CI failures won't block merges

---

## Release Package Contents

Each release includes:

1. **tsuryphone-card-X.X.X.zip** - Complete HACS package containing:
   - `tsuryphone-card.js` (built bundle)
   - `tsuryphone-card.js.map` (source map)
   - `hacs.json`
   - `info.md`
   - `README.md`
   - `LICENSE`

2. **tsuryphone-card-X.X.X.zip.sha256** - Checksum file

3. **tsuryphone-card.js** - Standalone bundle

4. **tsuryphone-card.js.map** - Source map

---

## First Release Workflow

When you're ready to create the first release:

```bash
# 1. Commit all your changes
git add .
git commit -m "feat: initial release - Phase 3.5 complete"

# 2. Push to GitHub
git push origin main

# 3. Auto-release workflow will:
#    - Bump version to 0.1.1-alpha
#    - Build the bundle
#    - Create tag v0.1.1-alpha
#    - Create GitHub Release
```

---

## Monitoring Workflows

Check workflow status:

- Go to: `https://github.com/Tsury/ha-tsuryphone-frontend-new/actions`
- View recent runs
- Check logs if failures occur

Common issues:

- **Build failure**: Check TypeScript errors in CI logs
- **Version bump failure**: Ensure `package.json` has valid semver
- **Release failure**: Check GitHub token permissions

---

## HACS Integration

After first release:

1. Go to HACS in Home Assistant
2. Add custom repository:
   - URL: `https://github.com/Tsury/ha-tsuryphone-frontend-new`
   - Category: `Lovelace` (Frontend)
3. Install "TsuryPhone Card"
4. The zip release will be used automatically

---

## Next Steps After Push

1. ✅ Push to GitHub
2. ✅ Verify auto-release succeeds
3. ✅ Add to HACS as custom repository
4. ✅ Install via HACS
5. ✅ Run smoke test (see `SMOKE_TEST.md`)
