import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createTask, getModels, getTaskStatus, getTask } from '../api.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const handleCreate = async (options = {}) => {
  const models = await getModels().catch(() => []);
  const defaultModel = models.length > 0 ? models[0] : 'deepseek-v3';

  let answers;

  if (options.interactive === false) {
    if (!options.prompt) {
      console.log(chalk.red('Error: --prompt is required in non-interactive mode.'));
      return;
    }
    answers = {
      name: options.name || 'My design project',
      prompt: options.prompt,
      scene: options.scene || '',
      format: options.format || 'webp',
      size: options.size || '1080x1440',
      width: options.width,
      height: options.height,
      model: options.model || defaultModel
    };
  } else {
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter design name:',
        default: 'My design project',
        validate: (input) => input.length > 0 || 'Name is required'
      },
      {
        type: 'input',
        name: 'prompt',
        message: 'Describe your design:',
        validate: (input) => input.length > 0 || 'Description is required'
      },
      {
        type: 'list',
        name: 'scene',
        message: 'Choose a scene type:',
        choices: [
          { name: 'None (Default)', value: '' },
          { name: 'Social Media', value: 'socialMedia' },
          { name: 'Poster', value: 'poster' },
          { name: 'Scrollytelling', value: 'scrollytelling' }
        ],
        default: ''
      },
      {
        type: 'list',
        name: 'format',
        message: 'Choose output format:',
        choices: ['webp', 'png', 'jpg'],
        default: 'webp'
      },
      {
        type: 'list',
        name: 'size',
        message: 'Choose a size:',
        choices: ['1080x1440', '1080x1920', '1920x1080', 'Custom'],
        default: '1080x1440'
      },
      {
        type: 'input',
        name: 'width',
        message: 'Enter width:',
        when: (answers) => answers.size === 'Custom',
        validate: (input) => !isNaN(parseInt(input)) || 'Width must be a number',
        default: '1080'
      },
      {
        type: 'input',
        name: 'height',
        message: 'Enter height (number or "auto"):',
        when: (answers) => answers.size === 'Custom',
        validate: (input) => input === 'auto' || !isNaN(parseInt(input)) || 'Height must be a number or "auto"',
        default: '1440'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Choose a model:',
        choices: models.length > 0 ? models : ['deepseek-v3'],
        default: models.length > 0 ? models[0] : 'deepseek-v3'
      }
    ]);
  }

  let width = 1080;
  let height = 1440;
  let isAutoHeight = false;

  if (answers.size === 'Custom') {
    width = parseInt(answers.width);
    if (answers.height === 'auto') {
      isAutoHeight = true;
      height = 1440; // Default placeholder for validation
    } else {
      height = parseInt(answers.height);
    }
  } else {
    const [w, h] = answers.size.split('x');
    width = parseInt(w);
    height = parseInt(h);
  }

  const taskData = {
    name: answers.name,
    prompt: answers.prompt,
    size: { w: width, h: height },
    model: answers.model,
    format: answers.format,
    scene: answers.scene
  };

  if (isAutoHeight) {
    taskData.height = 'auto';
  }

  const spinner = ora('Creating design task...').start();
  try {
    const response = await createTask(taskData);

    // The API returns { success: true, urls, task: { id, status, created_at } }
    // Or sometimes just { id: ... } depending on the endpoint version
    // Let's handle both cases

    let taskId;
    if (response.task && response.task.id) {
      taskId = response.task.id;
    } else {
      taskId = response.taskId || response.id;
    }

    if (taskId) {
      spinner.succeed(chalk.green(`Design task created successfully! Task ID: ${taskId}`));

      const pollSpinner = ora('Waiting for task completion...').start();
      let status = 'pending';
      let taskInfo = null;
      const startTime = Date.now();
      const timeout = 5 * 60 * 1000; // 5 minutes timeout

      while (['pending', 'processing', 'queued'].includes(status) && Date.now() - startTime < timeout) {
        await sleep(10000); // Poll every 2 seconds
        try {
          taskInfo = await getTaskStatus(taskId);
          status = taskInfo.status;
          pollSpinner.text = `Task status: ${status}`;
        } catch (err) {
          // Ignore transient errors
        }
      }

      if (status === 'completed' || status === 'success') {
        pollSpinner.succeed(chalk.green('Task completed successfully!'));

        try {
          const completedTask = await getTask(taskId);
          if (completedTask && completedTask.metadata && completedTask.metadata.urls && completedTask.metadata.urls.image) {
            console.log(chalk.cyan(`Image URL: ${completedTask.metadata.urls.image}`));
          }
        } catch (e) {
          // Ignore error if fetching details fails, basic success is already reported
        }
      } else if (Date.now() - startTime >= timeout) {
        pollSpinner.warn(chalk.yellow('Task polling timed out. It might still be processing.'));
      } else {
        pollSpinner.fail(chalk.red(`Task failed with status: ${status}`));
      }

      if (response.urls && response.urls.project) {
        console.log(chalk.blue(`Project URL: ${response.urls.project}`));
      }
      if (response.urls && response.urls.image) {
        console.log(chalk.blue(`Image URL: ${response.urls.image}`));
      }
    } else {
      spinner.fail(chalk.red('Failed to create task: No task ID received.'));
      if (response.message) {
        console.log(chalk.yellow(`Server message: ${response.message}`));
      }
    }
  } catch (error) {
    spinner.fail(chalk.red(`Create task failed: ${error.message}`));
  }
};
