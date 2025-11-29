#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { runCLI } from './cli';

const packageJson = require('../package.json');

program
  .name('ai-test-standards')
  .description('CLI para injetar padrões de QA e contexto de testes para IAs')
  .version(packageJson.version)
  .action(async () => {
    console.log(chalk.cyan.bold('\n🚀 Bem-vindo ao AI Test Context Standards!\n'));
    await runCLI();
  });

program.parse(process.argv);

