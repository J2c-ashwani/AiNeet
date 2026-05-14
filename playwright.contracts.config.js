const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/contracts',
  reporter: 'list',
});
