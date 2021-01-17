module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: ['eslint:recommended', 'airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'func-names': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    /* eslint-disable import/extensions */
  },
};
