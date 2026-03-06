import chalk from 'chalk';
import ora from 'ora';
import { listDesigns } from '../api.js';

export const handleList = async (options = {}) => {
  const spinner = ora('Fetching designs...').start();
  try {
    const designs = await listDesigns(options);
    spinner.stop();

    if (!designs || designs.length === 0) {
      console.log(chalk.yellow('No designs found.'));
      return;
    }

    console.log(chalk.green(`Found ${designs.length} designs:`));
    designs.forEach(design => {
      console.log(`${chalk.bold(design.name)} (ID: ${design.id})`);
      if (design.description) console.log(`  Description: ${design.description}`);
      console.log(`  Updated: ${new Date(design.updated_at).toLocaleString()}`);
      if (design.starred) console.log(chalk.yellow('  ★ Starred'));
      if (design.meta && design.meta.tag) console.log(`  Tag: ${design.meta.tag}`);
      console.log('');
    });

  } catch (error) {
    spinner.fail(chalk.red(`Failed to list designs: ${error.message}`));
  }
};

export const handleGetUrl = (designId) => {
  if (!designId) {
    console.log(chalk.red('Design ID is required'));
    return;
  }
  const url = `https://seede.ai/design/${designId}`;
  console.log(url);
};
