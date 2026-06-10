import { z } from 'zod';

export const configSchema = z.object({
  checks: z.record(z.string()).default({}),
  limits: z
    .object({
      timeoutSeconds: z.number().int().positive().default(900),
      maxChangedFiles: z.number().int().positive().default(40)
    })
    .default({ timeoutSeconds: 900, maxChangedFiles: 40 }),
  report: z
    .object({
      outputDir: z.string().default('.agentbench/runs')
    })
    .default({ outputDir: '.agentbench/runs' })
});

export type AgentBenchConfig = z.infer<typeof configSchema>;

export interface RunSummary {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  agentCommand: string;
  testCommand: string;
  root: string;
  worktreePath: string;
  reportPath: string;
  jsonPath: string;
  patchPath: string;
  filesChanged: number;
  addedLines: number;
  removedLines: number;
  agentExitCode: number | null;
  testExitCode: number | null;
  agentDurationMs: number;
  testDurationMs: number;
  createdAt: string;
}
