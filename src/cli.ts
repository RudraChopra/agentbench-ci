#!/usr/bin/env node
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import fsExtra from 'fs-extra';
import { loadConfig, writeDefaultConfig, CONFIG_FILE } from './config.js';
import { gitRoot } from './git.js';
import { newestSummary } from './report.js';
import { runAgentBench } from './runner.js';

const program = new Command();

program
  .name('agentbench')
  .description('Run AI coding agents in disposable git worktrees and grade their patches.')
  .version('0.1.0');

program
  .command('init')
  .description('Create agentbench.config.yml')
  .option('-f, --force', 'overwrite an existing config')
  .action(async (options) => {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if ((await fsExtra.pathExists(configPath)) && !options.force) {
      console.log(chalk.yellow(`${CONFIG_FILE} already exists. Use --force to overwrite.`));
      return;
    }
    const written = await writeDefaultConfig();
    console.log(chalk.green(`Created ${written}`));
  });

program
  .command('doctor')
  .description('Check whether AgentBench CI can run in this repo')
  .action(async () => {
    const root = await gitRoot().catch(() => null);
    if (!root) {
      console.log(chalk.red('Not inside a git repo. Run git init first.'));
      process.exitCode = 1;
      return;
    }
    const config = await loadConfig(root);
    console.log(chalk.green('Git repo found'));
    console.log(`Root: ${root}`);
    console.log(`Report dir: ${config.report.outputDir}`);
    console.log(`Default timeout: ${config.limits.timeoutSeconds}s`);
  });

program
  .command('run')
  .description('Run an agent command, then run checks, then write a report')
  .requiredOption('-a, --agent <command>', 'agent command to run')
  .option('-t, --test <command>', 'test command to run after the agent')
  .option('-n, --name <name>', 'human readable run name')
  .option('-k, --keep', 'keep the temporary worktree')
  .option('--timeout <seconds>', 'timeout in seconds', (value) => Number.parseInt(value, 10))
  .action(async (options) => {
    const summary = await runAgentBench({
      agentCommand: options.agent,
      testCommand: options.test,
      name: options.name,
      keep: options.keep,
      timeoutSeconds: options.timeout
    });
    const statusColor = summary.status === 'passed' ? chalk.green : chalk.red;
    console.log(statusColor(`Status: ${summary.status}`));
    console.log(`Files changed: ${summary.filesChanged}`);
    console.log(`Patch lines added: ${summary.addedLines}`);
    console.log(`Patch lines removed: ${summary.removedLines}`);
    console.log(`Agent duration: ${(summary.agentDurationMs / 1000).toFixed(2)}s`);
    console.log(`Test duration: ${(summary.testDurationMs / 1000).toFixed(2)}s`);
    console.log(`Report: ${summary.reportPath}`);
  });

program
  .command('report')
  .description('Print the newest report summary')
  .action(async () => {
    const root = await gitRoot();
    const config = await loadConfig(root);
    const summary = await newestSummary(path.join(root, config.report.outputDir));
    if (!summary) {
      console.log(chalk.yellow('No reports found. Run agentbench run first.'));
      return;
    }
    console.log(`Status: ${summary.status}`);
    console.log(`Name: ${summary.name}`);
    console.log(`Report: ${summary.reportPath}`);
  });

program.parseAsync().catch((error: unknown) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
