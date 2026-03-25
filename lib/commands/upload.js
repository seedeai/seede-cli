import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import { uploadFile } from '../api.js';

export const handleUpload = async (filePath) => {
  if (!filePath) {
    console.log(chalk.red('File path is required'));
    return;
  }

  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`File not found: ${filePath}`));
    return;
  }

  const spinner = ora(`Uploading ${filePath}...`).start();
  try {
    const asset = await uploadFile(filePath);
    spinner.succeed(chalk.green('Upload successful!'));
    console.log(JSON.stringify(asset, null, 2));

    // Suggest usage
    if (asset.url) {
      console.log(chalk.blue(`\nAsset URL: ${asset.url}`));
      console.log(chalk.gray(`Use in prompt: @SeedeReferenceImage(url:"${asset.url}", tag:"style,layout,color")`));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Upload failed: ${error.message}`));
  }
};
