import { execa } from 'execa';

export interface CommandResult {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut: boolean;
}

export async function runShellCommand(command: string, cwd: string, timeoutSeconds: number): Promise<CommandResult> {
  const started = Date.now();
  const result = await execa(command, {
    cwd,
    shell: true,
    all: false,
    reject: false,
    timeout: timeoutSeconds * 1000
  });
  return {
    command,
    exitCode: result.exitCode ?? null,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    durationMs: Date.now() - started,
    timedOut: Boolean(result.timedOut)
  };
}
