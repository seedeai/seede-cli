import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { login, register, sendVerificationCode, sendSmsCode } from './api.js';
import { setToken } from './config.js';

export const handleLogin = async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to login?',
      choices: ['Email', 'Phone']
    }
  ]);

  let credentials = {};

  if (method === 'Email') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input) => input.includes('@') || 'Please enter a valid email'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*'
      }
    ]);
    credentials = {
      email: answers.email.trim().toLowerCase(),
      password: answers.password
    };
  } else {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'country_code',
        message: 'Enter country code:',
        default: '+86'
      },
      {
        type: 'input',
        name: 'phone',
        message: 'Enter your phone number:',
        validate: (input) => /^\d+$/.test(input) || 'Please enter a valid phone number'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*'
      }
    ]);
    credentials = {
      phone: answers.phone.trim(),
      country_code: answers.country_code.trim(),
      password: answers.password
    };
  }

  const spinner = ora('Logging in...').start();
  try {
    const response = await login(credentials);
    const token = response.token;
    if (token) {
      setToken(token);
      spinner.succeed(chalk.green('Login successful! Token saved.'));
    } else {
      spinner.fail(chalk.red('Login failed: No token received.'));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Login failed: ${error.message}`));
  }
};

export const handleRegister = async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to register?',
      choices: ['Email', 'Phone']
    }
  ]);

  const commonAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter your name:',
      validate: (input) => input.length > 0 || 'Name is required'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your password (min 6 chars):',
      mask: '*',
      validate: (input) => input.length >= 6 || 'Password must be at least 6 characters'
    },
    {
      type: 'password',
      name: 'confirmPassword',
      message: 'Confirm your password:',
      mask: '*',
      validate: (input, answers) => input === answers.password || 'Passwords do not match'
    },
    {
      type: 'input',
      name: 'inviteCode',
      message: 'Enter invite code (optional):'
    }
  ]);

  let userData = {
    name: commonAnswers.name.trim(),
    password: commonAnswers.password,
    inviteCode: commonAnswers.inviteCode ? commonAnswers.inviteCode.trim() : '',
    language: 'en' // Default language
  };

  if (method === 'Email') {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (input) => input.includes('@') || 'Please enter a valid email'
      }
    ]);

    const codeSpinner = ora('Sending verification code...').start();
    try {
      await sendVerificationCode(email);
      codeSpinner.succeed(chalk.green('Verification code sent to your email.'));
    } catch (error) {
      codeSpinner.fail(chalk.red(`Failed to send verification code: ${error.message}`));
      return;
    }

    const { emailCode } = await inquirer.prompt([
      {
        type: 'input',
        name: 'emailCode',
        message: 'Enter email verification code:',
        validate: (input) => input.length > 0 || 'Verification code is required'
      }
    ]);
    userData.email = email.trim().toLowerCase();
    userData.emailCode = emailCode.trim();
  } else {
    const { country_code, phone } = await inquirer.prompt([
      {
        type: 'input',
        name: 'country_code',
        message: 'Enter country code:',
        default: '+86'
      },
      {
        type: 'input',
        name: 'phone',
        message: 'Enter your phone number:',
        validate: (input) => /^\d+$/.test(input) || 'Please enter a valid phone number'
      }
    ]);

    const codeSpinner = ora('Sending SMS verification code...').start();
    try {
      await sendSmsCode(phone, country_code);
      codeSpinner.succeed(chalk.green('SMS verification code sent to your phone.'));
    } catch (error) {
      codeSpinner.fail(chalk.red(`Failed to send SMS code: ${error.message}`));
      return;
    }

    const { smsCode } = await inquirer.prompt([
      {
        type: 'input',
        name: 'smsCode',
        message: 'Enter SMS verification code:',
        validate: (input) => input.length > 0 || 'Verification code is required'
      }
    ]);
    userData.country_code = country_code.trim();
    userData.phone = phone.trim();
    userData.smsCode = smsCode.trim();
  }

  const spinner = ora('Registering...').start();
  try {
    const response = await register(userData);
    const token = response.token;
    if (token) {
      setToken(token);
      spinner.succeed(chalk.green('Registration successful! You are now logged in.'));
    } else {
      spinner.succeed(chalk.green('Registration successful! Please login.'));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Registration failed: ${error.message}`));
  }
};
