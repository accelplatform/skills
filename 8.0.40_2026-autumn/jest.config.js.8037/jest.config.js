module.exports = {
  testMatch: ["src/test/jssp/**/*.test.js"],
  sourcePathMapping: {
    "src/test/jssp/src/": "src/main/jssp/src/"
  },
  collectCoverage: true,
  coverageDirectory: "target/coverage"
};
