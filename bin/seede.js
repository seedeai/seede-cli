#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { handleLogin, handleRegister } from '../lib/auth.js';
import { handleCreate } from '../lib/commands/create.js';
import { handleList, handleGetUrl } from '../lib/commands/designs.js';
import { handleUpload } from '../lib/commands/upload.js';
import { handleCreateToken, handleListTokens } from '../lib/commands/token.js';
import { handleListModels } from '../lib/commands/models.js';
import { clearToken, getToken } from '../lib/config.js';

const program = new Command();

program
  .name('seede')
  .description('Seede AI CLI Tool')
  .version('1.0.0');

program
  .command('login')
  .description('Log in to Seede AI')
  .action(async () => {
    await handleLogin();
  });

program
  .command('register')
  .description('Register a new account')
  .action(async () => {
    await handleRegister();
  });

program
  .command('create')
  .description('Create a new design task')
  .option('-n, --name <string>', 'Design name', 'My design project')
  .option('-p, --prompt <string>', 'Design prompt description')
  .option('-s, --scene <string>', 'Scene type (socialMedia, poster, scrollytelling)')
  .option('-f, --format <string>', 'Output format (webp, png, jpg)', 'webp')
  .option('--size <string>', 'Size (1080x1440, 1080x1920, 1920x1080, Custom)', '1080x1440')
  .option('-w, --width <number>', 'Custom width')
  .option('-h, --height <string>', 'Custom height (number or "auto")')
  .option('-m, --model <string>', 'Model to use')
  .option('-r, --ref <string...>', 'Reference images (format: url|tag1,tag2)', [])
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (options) => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleCreate(options);
  });

program
  .command('designs')
  .description('List designs')
  .option('-o, --offset <number>', 'Offset for pagination', 0)
  .option('-l, --limit <number>', 'Limit for pagination', 40)
  .option('-s, --starred', 'Filter by starred designs')
  .option('--order <string>', 'Order by field:direction (e.g. updated_at:DESC)', 'updated_at:DESC')
  .option('-q, --search <string>', 'Search term')
  .option('-t, --tag <string>', 'Filter by tag')
  .action(async (options) => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleList(options);
  });

program
  .command('open <designId>')
  .description('Get design URL')
  .action((designId) => {
    handleGetUrl(designId);
  });

program
  .command('upload <filePath>')
  .description('Upload an asset')
  .action(async (filePath) => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleUpload(filePath);
  });

program
  .command('models')
  .description('List supported models')
  .action(async () => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleListModels();
  });

const tokenCommand = program.command('token').description('Manage API tokens');

tokenCommand
  .command('create')
  .description('Create a new API token')
  .option('-n, --name <string>', 'Token name')
  .option('-e, --expiration <string>', 'Expiration in days')
  .option('--no-interactive', 'Disable interactive prompts')
  .action(async (options) => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleCreateToken(options);
  });

tokenCommand
  .command('list')
  .description('List your API tokens')
  .action(async () => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('You are not logged in. Please run "seede login" first.'));
      return;
    }
    await handleListTokens();
  });

program
  .command('logout')
  .description('Log out')
  .action(() => {
    clearToken();
    console.log(chalk.green('Logged out successfully.'));
  });

program
  .command('whoami')
  .description('Check login status')
  .action(() => {
    const token = getToken();
    if (token) {
      console.log(chalk.green('You are logged in.'));
      // Ideally, we would fetch user profile here.
    } else {
      console.log(chalk.yellow('You are not logged in.'));
    }
  });

program.parse(process.argv);
