export const PROVIDERS = {
  GITHUB: {
    name: 'Github',
    baseUrl: 'https://github.com',
    regexStr: 'https://github.com/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)/issues/([0-9]+)',
  },
  GITLAB: {
    name: 'Gitlab',
    baseUrl: 'https://gitlab.com',
    regexStr: 'https://gitlab.com/([a-zA-Z0-9_-]+)/([a-zA-Z0-9_-]+)/issues/([0-9]+)',
  },
};
