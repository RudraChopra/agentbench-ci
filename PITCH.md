# AgentBench CI pitch

AgentBench CI is a simple open source CLI for evaluating AI coding agents in real repositories.

## One sentence

Run Claude Code, Codex, Aider, or any coding agent inside a disposable git worktree, then get a clean patch and pass or fail report.

## Why people would star it

AI coding agents are spreading faster than teams can build evaluation habits. This repo gives developers an immediate safety layer that works with their current tools.

## Why people would download it

It is useful through one command:

```bash
npx agentbench-ci run --agent "codex exec 'fix the tests'" --test "npm test"
```

## First target users

1. Students building with coding agents
2. Open source maintainers reviewing AI generated PRs
3. Startups using Claude Code or Codex on real repos
4. People benchmarking multiple coding agents

## Bigger vision

AgentBench CI can become the standard lightweight eval layer for coding agents, like a smoke test harness for AI generated patches.
