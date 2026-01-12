module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        '**/*.config.js',
        '**/*.config.ts',
        '**/tests/**',
        '**/test/**',
        '**/__tests__/**',
      ]
    }],
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'max-len': ['error', { code: 100, ignoreComments: true, ignoreStrings: true }],
    'no-plusplus': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement']
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.worker.js'
  ]
};
