# DeloreanJS + unwinder-engine analysis

> AI-authored context note: This analysis was written by an AI assistant (Codex/GPT-5) from code inspection and package internals. It is intended as onboarding context for future human contributors and future AI agents.

## 1) What this project does

DeloreanJS is a web debugger for JavaScript with "back in time" execution.

Core behavior:

- run user JS code in the browser
- create timepoints (`delorean.insertTimepoint(...)` or implicit mode)
- capture tracked variable values into snapshots
- select a past timepoint and resume from there (branch timeline)
- compare/inspect state across timeline branches

Main flow in this repo:

1. UI triggers execution in [`../src/App.js`](../src/App.js), through `StoreFacade.execution.runCurrentTab(...)`.
2. Runtime entry in [`../src/core/runtime-service.js`](../src/core/runtime-service.js): `initializeExecution({ code, implicitTimepoints })`.
3. Debugger entry in [`../src/core/debugger.js`](../src/core/debugger.js): `debuggerDelorean.init(code)`.
4. Static analysis + instrumentation in [`../src/core/static-analysis/index.js`](../src/core/static-analysis/index.js): Babel visitors add dependency tracking, continuation capture hooks, heap restore logic, then call `compile(...)` from `unwinder-engine`.
5. Instrumented code is compiled to continuation-enabled JS and `eval(...)` runs it.
6. Resume action calls `invokeContinuation(timepointId)` and executes stored continuation (`continuations.kont<id>()`), generating a new timeline branch.

## 2) What `unwinder-engine` does

In this project, `unwinder-engine@0.0.3` is the continuation runtime/compiler that powers rewind/resume.

From installed package internals:

- `compile(input)` (`node_modules/unwinder-engine/bin/compile.js`)
  - runs `sweet.js` compile
  - transforms code with a regenerator-derived compiler (`main.js`) into state-machine style JS
  - injects VM runtime symbols (`$Machine`, `$Frame`, `$ContinuationExc`, `$DebugInfo`)
  - builds and runs a VM instance over generated code
- `vm` export (`node_modules/unwinder-engine/runtime/vm.js`)
  - machine execution states (`idle/suspended/executing`)
  - continuation capture/invoke (`callCC`, `ContinuationExc`)
  - debugger controls (`toggleBreakpoint`, `continue`, `step`, `stepOver`, `evaluate`, `abort`)
  - async events (`paused`, `resumed`, `finish`, `error`, `cont-invoked`, `watched`)

Net effect:

- normal JS is transformed into resumable execution frames
- continuation objects can be stored and invoked later
- stepping/breakpoint semantics are available via VM state

## 3) How DeloreanJS uses it specifically

DeloreanJS adds domain-specific instrumentation before handing code to `unwinder-engine`:

- dependency detection visitors fill `global.dependencies` and heap metadata
- continuation factory visitor injects:
  - `createContinuation() { return callCC(cont => cont); }`
  - `continuations = {}`
- store-continuation visitor injects continuation creation after each timepoint/breakpoint call
- restore-heap visitor injects logic to snapshot dependency values and rehydrate values when resuming from the future

This gives DeloreanJS two key capabilities:

1. snapshot values at timepoints
2. jump back by invoking saved continuations

Without `unwinder-engine`, the resume-from-timepoint model in this repo does not work.

## 4) Constraints and risks

- package is legacy; upstream README explicitly warns it is old/hacky and not production-grade
- dependency graph is very old (legacy parser/compiler stack, old webpack/sweet.js ecosystem)
- browser compatibility requires node-core polyfills (see [`../craco.config.js`](../craco.config.js))
- modern syntax/runtime edge-cases can break unless code is transformed carefully first

## 5) TL;DR

`unwinder-engine` is the continuation VM/compiler. DeloreanJS is the debugger UX + AST instrumentation layer built on top of it to do timepoint snapshots and resume execution from past states.
