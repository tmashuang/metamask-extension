module.exports = {
  restoreMocks: true,
  coverageDirectory: 'jest-coverage/',
  collectCoverageFrom: [
    '<rootDir>/ui/**/swaps/**',
    '<rootDir>/ui/ducks/send/**',
  ],
  coveragePathIgnorePatterns: ['.stories.js', '.snap'],
  coverageThreshold: {
    global: {
      branches: 45.24,
      functions: 51.94,
      lines: 58.36,
      statements: 58.6,
    },
  },
  setupFiles: ['./test/setup.js', './test/env.js'],
  setupFilesAfterEnv: ['./test/jest/setup.js'],
<<<<<<< HEAD
  testMatch: [
    '<rootDir>/ui/**/?(*.)+(test).js',
    '<rootDir>/shared/**/?(*.)+(test).js',
=======
  testMatch: ['<rootDir>/**/*.test.js'],
  testPathIgnorePatterns: [
    '<rootDir>/app/scripts/metamask-controller.test.js',
    '<rootDir>/app/scripts/controllers/transactions/index.test.js',
    '<rootDir>/app/scripts/controllers/network/pending-middleware.test.js',
    '<rootDir>/app/scripts/controllers/permissions/permissions-middleware.test.js',
    '<rootDir>/test/unit-global/',
>>>>>>> b93452754 (Add exempted files that need to be rewritten from ground up from mocha to jest)
  ],
};
