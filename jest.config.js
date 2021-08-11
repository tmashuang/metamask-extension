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
  testMatch: ['<rootDir>/**/*.test.js', '<rootDir>/shared/**/?(*.)+(test).js'],
  testPathIgnorePatterns: [
    '<rootDir>/app/scripts/metamask-controller.test.js',
    // '<rootDir>/app/scripts/controllers/transactions/index.test.js',
    // '<rootDir>/app/scripts/controllers/network/pending-middleware.test.js',
    // '<rootDir>/app/scripts/controllers/permissions/permissions-middleware.test.js',
    '<rootDir>/test/unit-global/',
  ],
};
