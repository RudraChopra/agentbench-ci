import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { AgentBenchConfig, configSchema } from './schema.js';

export const CONFIG_FILE = 'agentbench.config.yml';

export async function loadConfig(cwd = process.cwd()): Promise<AgentBenchConfig> {
  const configPath = path.join(cwd, CONFIG_FILE);
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const parsed = YAML.parse(raw) ?? {};
    return configSchema.parse(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return configSchema.parse({});
    }
    throw error;
  }
}

export async function writeDefaultConfig(cwd = process.cwd()): Promise<string> {
  const configPath = path.join(cwd, CONFIG_FILE);
  const body = YAML.stringify({
    checks: {
      test: 'npm test'
    },
    limits: {
      timeoutSeconds: 900,
      maxChangedFiles: 40
    },
    report: {
      outputDir: '.agentbench/runs'
    }
  });
  await fs.writeFile(configPath, body, 'utf8');
  return configPath;
}
