# AgentBench CI

Run AI coding agents in disposable git worktrees, grade their patches, and publish clean CI reports.

AgentBench CI is a tiny command line tool for people using Claude Code, Codex, Aider, Cursor agents, or custom scripts. It lets you evaluate an agent before trusting it with your main branch.

```bash
npm install -g agentbench-ci
agentbench init
agentbench run --agent "codex exec 'fix the failing test'" --test "npm test"
```

## Why this exists

AI coding agents are getting good enough to touch real code, but most teams still judge them by vibes. AgentBench CI makes each run reproducible:

1. Creates a temporary git worktree
2. Runs your agent command inside the worktree
3. Captures the patch, files changed, and command logs
4. Runs tests, lint, or any check command
5. Saves a Markdown plus JSON report under `.agentbench/runs`

## Demo

```bash
agentbench run \
  --agent "aider --message 'make the tests pass'" \
  --test "npm test" \
  --name "aider baseline"
```

Output:

```text
AgentBench CI report
Status: passed
Files changed: 3
Patch lines added: 42
Patch lines removed: 18
Agent duration: 31.2s
Test duration: 8.4s
Report: .agentbench/runs/2026-06-10T21-40-10-000Z/report.md
```

## Works with any agent

AgentBench CI does not depend on a specific model or vendor. It just runs shell commands.

| Tool | Example agent command |
| --- | --- |
| Claude Code | `claude "fix the failing test"` |
| Codex | `codex exec "fix the failing test"` |
| Aider | `aider --message "fix the failing test"` |
| Custom script | `python scripts/my_agent.py` |

## Quick start

```bash
agentbench init
agentbench doctor
agentbench run --agent "echo 'no op'" --test "npm test"
agentbench report
```

## Config

Create `agentbench.config.yml`:

```yml
checks:
  test: npm test
  lint: npm run lint
limits:
  timeoutSeconds: 900
  maxChangedFiles: 40
report:
  outputDir: .agentbench/runs
```

## GitHub Actions

```yml
name: AgentBench CI
on:
  pull_request:
  workflow_dispatch:
jobs:
  agentbench:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: node dist/cli.js doctor
```

## Commands

### `agentbench init`

Creates a starter config.

### `agentbench doctor`

Checks git, Node, config, and basic project state.

### `agentbench run`

Runs one agent attempt inside a disposable worktree.

```bash
agentbench run --agent "codex exec 'add tests for parser'" --test "npm test" --name parser-test
```

Options:

| Option | Meaning |
| --- | --- |
| `--agent` | Command to run as the agent |
| `--test` | Command to run after the agent |
| `--name` | Human readable run name |
| `--keep` | Keep the worktree for debugging |
| `--timeout` | Timeout in seconds |

### `agentbench report`

Prints the newest report path and summary.

## What makes this useful

Most agent benchmarks are either huge academic suites or private dashboards. AgentBench CI is meant to be boring, fast, and easy to add to any repo.

Good open source wedge:

1. Every AI builder can understand it in 30 seconds
2. It has a CLI that can be used through `npx`
3. It creates visible artifacts people can share in issues and pull requests
4. It is vendor neutral
5. It solves an actual pain point for agent developers

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT
