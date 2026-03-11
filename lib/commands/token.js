import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createToken, listTokens, deleteToken } from '../api.js';

export const handleCreateToken = async (options = {}) => {
  let answers;

  if (options.interactive === false) {
    answers = {
      name: options.name || 'My API Token',
      expiration: options.expiration
    };
  } else {
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter token name:',
        default: 'My API Token',
        validate: (input) => input.length > 0 || 'Name is required'
      },
      {
        type: 'input',
        name: 'expiration',
        message: 'Enter expiration in days (leave empty for never):',
        validate: (input) => {
          if (input === '') return true;
          const num = parseInt(input);
          return (!isNaN(num) && num > 0) || 'Please enter a valid number of days';
        }
      }
    ]);
  }

  const spinner = ora('Creating token...').start();

  try {
    const token = await createToken(answers);
    spinner.succeed('Token created successfully!');
    
    console.log('');
    console.log(chalk.bold('Name: ') + token.name);
    console.log(chalk.bold('Token: ') + chalk.green(token.token));
    if (token.expired_at) {
      console.log(chalk.bold('Expires: ') + new Date(token.expired_at).toLocaleString());
    } else {
      console.log(chalk.bold('Expires: ') + 'Never');
    }
    console.log('');
    console.log(chalk.yellow('Make sure to copy your token now. You won\'t be able to see it again!'));
    
  } catch (error) {
    spinner.fail(`Failed to create token: ${error.message}`);
  }
};

export const handleListTokens = async () => {
  const spinner = ora('Fetching tokens...').start();

  try {
    const tokens = await listTokens();
    spinner.stop();

    if (tokens.length === 0) {
      console.log(chalk.yellow('No tokens found.'));
      return;
    }

    console.log(chalk.bold('\nYour API Tokens:'));
    console.log('--------------------------------------------------');
    
    tokens.forEach(token => {
      const status = token.is_active ? chalk.green('Active') : chalk.red('Inactive');
      const expires = token.expired_at ? new Date(token.expired_at).toLocaleDateString() : 'Never';
      
      console.log(`${chalk.bold(token.name)} (${status})`);
      console.log(`  ID: ${token.id}`);
      console.log(`  Token: ${token.token}`);
      console.log(`  Created: ${new Date(token.created_at).toLocaleDateString()}`);
      console.log(`  Expires: ${expires}`);
      console.log('--------------------------------------------------');
    });

  } catch (error) {
    spinner.fail(`Failed to list tokens: ${error.message}`);
  }
};
