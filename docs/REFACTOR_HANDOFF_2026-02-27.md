# DeloreanJS Refactor Handoff (February 27, 2026)

> AI-authored context note: This handoff document was written by an AI assistant (Codex/GPT-5) based on repository state and debugging traces. It is preserved as historical context for future human contributors and future AI agents.

## 1) Current status

- Dependency modernization is partially done:
  - `react` / `react-dom` on 18.x
  - `react-scripts` on 5.x
  - build pipeline moved to `craco`
  - Node 20 baseline
- App now boots (`npm start`) and compiles (`npm run build`), but functional debugger flow is still broken (run/track/resume behavior is not reliable).
- Tests currently passing are low-level/unit smoke only; they do not prove full UI execution flow in browser.

### Update after browser runtime trace

- Browser error `evalStrategies[evalStrategyId] is not a function` on `test1.js` is expected from the sample itself (it intentionally contains a bug scenario).
- Real functional issue found: editor can stay blank because no selected tab is initialized and render path relied on side effects.
- Implemented stabilization:
  - first tab now selected by default in `EditorContainer`
  - `StoreFacade` now initializes watch variables from selected tab
  - `StoreFacade.syncState()` now always calls container `setState(...)` (subscriber updates propagate)

## 2) What was changed today (important context)

### Toolchain and deps

- Removed unused MUI packages (root peer-conflict source).
- Added webpack 5/browser compatibility via `craco.config.js`.
- Added polyfills/fallbacks for legacy runtime dependencies (`path`, `process`, `stream`, etc.).
- Added temporary compatibility shims to keep legacy `babel-core` path from crashing in browser:
  - `src/shims/tty.js`
  - `src/shims/babel-core-logger.js`
- Added warning filters for noisy non-functional warnings (console-feed sourcemaps + legacy critical dependency warnings).

### Refactor already in progress

- Runtime facade exists: `src/core/runtime-service.js`
- Modular containers exist: `EditorContainer`, `ExecutionContainer`, `TimelineContainer`, `WatchContainer`, `StoreFacade`
- `App.js` wired through store facade/runtime service.

## 3) Known symptoms and likely root causes

## Symptom A: UI renders but execute flow appears to do nothing

High-probability causes:

1. Silent runtime failure is swallowed in `src/core/debugger.js`.
   - `init()` and `invokeContinuation()` catch errors and only `console.error(...)`.
   - Errors are not rethrown, so state layer can think execution succeeded.
2. Legacy visitor code writes to undeclared `parent` symbol in strict mode.
   - ESLint already flags this (`no-global-assign`) in:
     - `src/core/static-analysis/visitors/common/restore-heap.visitor.js`
     - `src/core/static-analysis/visitors/continuation/store-continuation.visitor.js`
     - `src/core/static-analysis/visitors/implicit-timepoint/assignment.visitor.js`
     - `src/core/static-analysis/visitors/implicit-timepoint/unary.visitor.js`
     - `src/core/static-analysis/visitors/implicit-timepoint/update.visitor.js`
   - This can throw during AST traversal.
3. No selected tab edge case.
   - `StoreFacade.getSelectedEditor()` mutates state during render via `setDefaultTab()`.
   - In React 18, render-time updates are fragile and may lead to blank editor/no selected tab.
   - If no tab is selected, `runCurrentTab()` returns `null` and execution never starts.

## Symptom B: dependency warnings were blocking confidence

- `console-feed` source-map warnings were noise, not functional blockers.
- `babel-core` critical dependency warnings are expected for this legacy pipeline.

## 4) Tomorrow plan (execution order)

## Phase 0: Freeze and observe (30-45 min)

1. Confirm baseline:
   - `node -v` (must be 20.x)
   - `npm -v`
   - `npm install --legacy-peer-deps --no-audit --no-fund`
2. Start with clean cache:
   - stop dev server
   - `rm -rf node_modules/.cache`
   - `npm start`
3. Reproduce with `test1.js`: click run, then collect browser console errors.

Definition of done for Phase 0:
- exact first runtime exception is captured from browser console for run flow.

## Phase 1: Restore functional run path (P0, no architecture change) (1.5-3h)

1. Stop swallowing runtime errors:
   - in `src/core/debugger.js`, rethrow after logging in `init()` and `invokeContinuation()`.
   - ensure `runtime-service` sets `ERROR` and surfaces failure.
2. Fix strict-mode visitor bugs:
   - replace undeclared `parent = ...` with local `let parent = ...` in all flagged visitor files.
3. Fix tab selection bootstrap:
   - avoid state mutation in render path (`getSelectedEditor`/`setDefaultTab` pattern).
   - set one initial selected tab in container state initialization.
4. Verify run behavior:
   - run `test1.js`
   - confirm timeline entries appear
   - confirm snapshots/dependencies populate
   - confirm stop clears state and second run is clean.

Definition of done for Phase 1:
- user can run/stop/resume at least with built-in `test1.js` and see timeline updates.

## Phase 2: Add regression safety around real failure modes (1-2h)

1. Add/extend tests for:
   - runtime error propagation (`debugger.init` failure -> execution status `ERROR`)
   - selected tab required path (`runCurrentTab` cannot silently no-op without explicit signal)
   - run -> stop -> run no stale snapshot carry-over.
2. Add a small integration assertion around visitor preparation path with fixture input.

Definition of done for Phase 2:
- failing behavior from today is covered by tests and cannot silently regress.

## Phase 3: Cleanups after functional parity (optional, separate PR)

1. Replace direct DOM tab styling (`stilizeSelectedTab`) with state-driven class rendering.
2. Revisit warning suppressions once runtime is stable.
3. Evaluate medium-term replacement plan for browser `babel-core@6` pipeline.

## 5) Risk register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Legacy browser runtime (`babel-core@6` + `unwinder-engine`) breaks in modern bundling | High | High | Keep CRACO aliases/shims until functional parity is restored; do not remove shims first |
| Silent execution failures hide root cause | High | High | Rethrow errors from debugger layer and propagate explicit error status |
| React 18 stricter rendering semantics expose old state-mutation patterns | High | Medium | Remove state updates during render; initialize selected tab deterministically |
| Over-upgrading dependencies before behavior parity | High | Medium | Freeze versions during recovery; defer further upgrades |
| Warning noise distracts from real blockers | Medium | High | Keep filtered warnings temporary; focus on runtime console and functional checks |

## 6) Do-not-repeat checklist

1. Do not use `--force` installs.
2. Do not remove `craco` and fallback/alias config yet.
3. Do not treat warning cleanup as functional fix.
4. Do not continue dependency upgrades until Phase 1 passes.
5. Do not trust unit tests alone; always run manual browser flow (run/stop/resume).

## 7) Commands to resume tomorrow

```bash
cd /Users/feliperuiz/fruizrob/deloreanjs
node -v
npm -v
npm install --legacy-peer-deps --no-audit --no-fund
rm -rf node_modules/.cache
npm start
```

Validation commands after fixes:

```bash
npm run test -- --watchAll=false
npm run build
```

## 8) Primary files to inspect first tomorrow

- `src/core/debugger.js`
- `src/core/runtime-service.js`
- `src/core/static-analysis/index.js`
- `src/core/static-analysis/visitors/common/restore-heap.visitor.js`
- `src/core/static-analysis/visitors/continuation/store-continuation.visitor.js`
- `src/core/static-analysis/visitors/implicit-timepoint/assignment.visitor.js`
- `src/core/static-analysis/visitors/implicit-timepoint/unary.visitor.js`
- `src/core/static-analysis/visitors/implicit-timepoint/update.visitor.js`
- `src/containers/EditorContainer.js`
- `src/containers/StoreFacade.js`

## 9) Related context docs

- `./UNWINDER_ENGINE_ANALYSIS.md` (package internals and architectural dependency notes)
