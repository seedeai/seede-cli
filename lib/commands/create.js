import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createTask, getModels, getTaskStatus, getTask } from '../api.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const handleCreate = async (options = {}) => {
  const models = await getModels().catch(() => []);
  const defaultModel = models.length > 0 ? models[0] : 'gemini-3-flash';
  const modelChoices = models.length > 0 ? models.slice() : ['gemini-3-flash'];
  if (options.model && !modelChoices.includes(options.model)) {
    modelChoices.unshift(options.model);
  }
  const defaultModelChoice = options.model || defaultModel;

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
      size: options.size || (options.scene === 'scrollytelling' ? '1080x3688' : '1080x1440'),
      width: options.width,
      height: options.height,
      model: options.model || defaultModel
    };
    if (Array.isArray(options.ref) && options.ref.length > 0) {
      const directives = options.ref.map((item) => {
        const parts = String(item).split('|');
        const url = (parts[0] || '').trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
        const tags = (parts[1] || '').trim();
        return `@SeedeReferenceImage(url: '${url}', tag: '${tags}')`;
      });
      answers.prompt = `${answers.prompt}\n${directives.join('\n')}`;
    }
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
        choices: ['1080x1440', '1080x1920', '1920x1080', '1080x3688', 'Custom'],
        default: (ans) => (ans.scene === 'scrollytelling' ? '1080x3688' : '1080x1440')
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
        choices: modelChoices,
        default: defaultModelChoice
      }
    ]);
    let addRef = false;
    const refConfirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addRef',
        message: 'Add reference images?',
        default: false
      }
    ]);
    addRef = refConfirm.addRef;
    if (addRef) {
      const directives = [];
      let more = true;
      while (more) {
        const refAns = await inquirer.prompt([
          {
            type: 'input',
            name: 'url',
            message: 'Reference image URL:',
            validate: (input) => input && input.length > 0 || 'URL is required'
          },
          {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma separated, e.g. style,layout,color):',
            default: 'style,layout,color'
          }
        ]);
        const url = String(refAns.url).trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
        const tags = String(refAns.tags).trim();
        directives.push(`@SeedeReferenceImage(url: '${url}', tag: '${tags}')`);
        const moreAns = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'more',
            message: 'Add another reference image?',
            default: false
          }
        ]);
        more = moreAns.more;
      }
      answers.prompt = `${answers.prompt}\n${directives.join('\n')}`;
    }
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
