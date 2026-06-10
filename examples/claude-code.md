# Claude Code example

```bash
agentbench run \
  --agent "claude 'fix the failing unit test and explain the patch in comments only if needed'" \
  --test "npm test" \
  --name "claude code baseline"
```
