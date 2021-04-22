module.exports = {
  testMatch: ['<rootDir>/tests/**/*.{spec,test}.{js,ts}'],
  preset: 'ts-jest',
  coverageReporters: ['json', 'text-summary', 'text', 'html', 'lcov'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'test.xml',
      },
    ],
  ],
};
