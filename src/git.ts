import path from 'node:path';
import { execa } from 'execa';

export async function gitRoot(cwd = process.cwd()): Promise<string> {
  const result = await execa('git', ['rev-parse', '--show-toplevel'], { cwd });
  return result.stdout.trim();
}

export async function currentBranch(cwd: string): Promise<string> {
  const result = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd });
  return result.stdout.trim();
}

export async function createWorktree(root: string, id: string): Promise<string> {
  const worktreePath = path.join(root, '.agentbench', 'worktrees', id);
  const branch = await currentBranch(root);
  await execa('git', ['worktree', 'add', '--detach', worktreePath, branch], { cwd: root });
  return worktreePath;
}

export async function removeWorktree(root: string, worktreePath: string): Promise<void> {
  await execa('git', ['worktree', 'remove', '--force', worktreePath], { cwd: root });
}

export async function getDiff(cwd: string): Promise<string> {
  const result = await execa('git', ['diff', '--binary'], { cwd, reject: false });
  return result.stdout;
}

export async function changedFiles(cwd: string): Promise<string[]> {
  const result = await execa('git', ['diff', '--name-only'], { cwd, reject: false });
  return result.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function countPatchLines(diff: string): { addedLines: number; removedLines: number } {
  let addedLines = 0;
  let removedLines = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) addedLines += 1;
    if (line.startsWith('-')) removedLines += 1;
  }
  return { addedLines, removedLines };
}
