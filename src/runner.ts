import path from 'node:path';
import fsExtra from 'fs-extra';
import { loadConfig } from './config.js';
import { changedFiles, countPatchLines, createWorktree, getDiff, gitRoot, removeWorktree } from './git.js';
import { writeReport, safeRunId } from './report.js';
import { RunSummary } from './schema.js';
import { runShellCommand } from './shell.js';

export interface RunOptions {
  agentCommand: string;
  testCommand?: string;
  name?: string;
  keep?: boolean;
  timeoutSeconds?: number;
}

export async function runAgentBench(options: RunOptions): Promise<RunSummary> {
  const root = await gitRoot();
  const config = await loadConfig(root);
  const id = safeRunId();
  const runName = options.name ?? id;
  const timeout = options.timeoutSeconds ?? config.limits.timeoutSeconds;
  const testCommand = options.testCommand ?? config.checks.test ?? 'npm test';
  const outputDir = path.join(root, config.report.outputDir);
  const runDir = path.join(outputDir, id);
  const reportPath = path.join(runDir, 'report.md');
  const jsonPath = path.join(runDir, 'summary.json');
  const patchPath = path.join(runDir, 'patch.diff');

  await fsExtra.ensureDir(path.join(root, '.agentbench', 'worktrees'));
  const worktreePath = await createWorktree(root, id);

  try {
    const agentResult = await runShellCommand(options.agentCommand, worktreePath, timeout);
    const diff = await getDiff(worktreePath);
    const files = await changedFiles(worktreePath);
    const testResult = await runShellCommand(testCommand, worktreePath, timeout);
    const patchCounts = countPatchLines(diff);
    const status = agentResult.exitCode === 0 && testResult.exitCode === 0 ? 'passed' : 'failed';

    const summary: RunSummary = {
      id,
      name: runName,
      status,
      agentCommand: options.agentCommand,
      testCommand,
      root,
      worktreePath,
      reportPath,
      jsonPath,
      patchPath,
      filesChanged: files.length,
      addedLines: patchCounts.addedLines,
      removedLines: patchCounts.removedLines,
      agentExitCode: agentResult.exitCode,
      testExitCode: testResult.exitCode,
      agentDurationMs: agentResult.durationMs,
      testDurationMs: testResult.durationMs,
      createdAt: new Date().toISOString()
    };

    await writeReport({ outputDir, summary, agentResult, testResult, diff });
    return summary;
  } finally {
    if (!options.keep) {
      await removeWorktree(root, worktreePath).catch(() => undefined);
    }
  }
}
