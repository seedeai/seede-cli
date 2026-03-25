import chalk from 'chalk';
import ora from 'ora';
import { getModels } from '../api.js';

export const handleListModels = async () => {
  const spinner = ora('Fetching supported models...').start();
  try {
    const models = await getModels();
    spinner.stop();
    if (!models || models.length === 0) {
      console.log(chalk.yellow('No models available.'));
      return;
    }
    console.log(chalk.bold('\nSupported Models:'));
    models.forEach((m, i) => {
      console.log(`${String(i + 1).padStart(2, ' ')}. ${m}`);
    });
  } catch (e) {
    spinner.fail(`Failed to fetch models: ${e.message}`);
  }
};
