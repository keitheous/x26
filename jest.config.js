const base = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
};

module.exports = {
  projects: [
    {
      ...base,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/domain/**/*.test.ts', '<rootDir>/tests/services/**/*.test.ts'],
    },
    {
      ...base,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
    },
  ],
};
