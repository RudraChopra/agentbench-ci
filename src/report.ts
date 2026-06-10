import fs from 'node:fs/promises';
import path from 'node:path';
import fsExtra from 'fs-extra';
import { RunSummary } from './schema.js';
import { CommandResult } from './shell.js';

export function safeRunId(date = new Date()): string {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-');
}

export async function writeReport(input: {
  outputDir: string;
  summary: RunSummary;
  agentResult: CommandResult;
  testResult: CommandResult;
  diff: string;
}): Promise<void> {
  const runDir = path.dirname(input.summary.reportPath);
  await fsExtra.ensureDir(runDir);
  await fs.writeFile(input.summary.patchPath, input.diff || '# No diff produced\n', 'utf8');
  await fs.writeFile(input.summary.jsonPath, JSON.stringify(input.summary, null, 2), 'utf8');

  const md = [
    `# AgentBench CI report`,
    ``,
    `| Field | Value |`,
    `| --- | --- |`,
    `| Status | ${input.summary.status} |`,
    `| Run | ${input.summary.name} |`,
    `| Created | ${input.summary.createdAt} |`,
    `| Files changed | ${input.summary.filesChanged} |`,
    `| Lines added | ${input.summary.addedLines} |`,
    `| Lines removed | ${input.summary.removedLines} |`,
    `| Agent duration | ${(input.summary.agentDurationMs / 1000).toFixed(2)}s |`,
    `| Test duration | ${(input.summary.testDurationMs / 1000).toFixed(2)}s |`,
    ``,
    `## Agent command`,
    ``,
    '```bash',
    input.summary.agentCommand,
    '```',
    ``,
    `Exit code: ${input.summary.agentExitCode}`,
    ``,
    `## Test command`,
    ``,
    '```bash',
    input.summary.testCommand,
    '```',
    ``,
    `Exit code: ${input.summary.testExitCode}`,
    ``,
    `## Agent stdout`,
    ``,
    '```text',
    truncate(input.agentResult.stdout),
    '```',
    ``,
    `## Agent stderr`,
    ``,
    '```text',
    truncate(input.agentResult.stderr),
    '```',
    ``,
    `## Test stdout`,
    ``,
    '```text',
    truncate(input.testResult.stdout),
    '```',
    ``,
    `## Test stderr`,
    ``,
    '```text',
    truncate(input.testResult.stderr),
    '```',
    ``,
    `## Patch`,
    ``,
    `See \`${path.basename(input.summary.patchPath)}\`.`,
    ``
  ].join('\n');

  await fs.writeFile(input.summary.reportPath, md, 'utf8');
}

export async function newestSummary(outputDir: string): Promise<RunSummary | null> {
  const exists = await fsExtra.pathExists(outputDir);
  if (!exists) return null;
  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().reverse();
  for (const dir of dirs) {
    const jsonPath = path.join(outputDir, dir, 'summary.json');
    if (await fsExtra.pathExists(jsonPath)) {
      const raw = await fs.readFile(jsonPath, 'utf8');
      return JSON.parse(raw) as RunSummary;
    }
  }
  return null;
}

function truncate(value: string, max = 20000): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n... truncated ...`;
}
