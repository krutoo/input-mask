module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb-typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: [
      './tsconfig.eslint.json',
    ],
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-plusplus': 'off',
    'default-case': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', {
      functions: false,
      classes: false,
      variables: false,
      enums: false,
      typedefs: false,
      ignoreTypeReferences: false,
    }],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'object-curly-newline': ['error', {
      ObjectExpression: { consistent: true },
      ObjectPattern: { consistent: true },
      ImportDeclaration: { consistent: true },
      ExportDeclaration: { consistent: true },
    }],
    'no-param-reassign': ['error', {
      props: false,
    }],
    'import/no-extraneous-dependencies': 'off',
    'react/no-array-index-key': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'max-len': ['error', 100],
    'react/button-has-type': ['error'],
    'jsx-a11y/label-has-associated-control': 'off',
  },
};
