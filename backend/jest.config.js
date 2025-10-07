module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Exclude main entry point
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
