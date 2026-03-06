import Conf from 'conf';

const config = new Conf({
  projectName: 'seede-cli'
});

export const setToken = (token) => {
  config.set('token', token);
};

export const getToken = () => {
  return config.get('token');
};

export const clearToken = () => {
  config.delete('token');
};

export const getApiUrl = () => {
  return process.env.SEEDE_API_URL || 'https://api.seede.ai';
};
