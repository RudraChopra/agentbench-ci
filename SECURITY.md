# Security

AgentBench CI runs shell commands that you provide. Treat agent commands like any other untrusted code execution.

## Safe usage tips

1. Run inside a clean repository
2. Avoid exposing private environment variables
3. Review generated patches before merging
4. Prefer CI secrets with the minimum permissions needed
5. Use disposable tokens when testing agents

## Reporting issues

Please open a private security advisory on GitHub if you find a vulnerability.
