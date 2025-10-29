/**
 * Lint-staged Configuration
 * Runs linters on git staged files before commit
 *
 * @see https://github.com/lint-staged/lint-staged
 */

export default {
  // Run Biome check and format on TypeScript/JavaScript files
  '*.{ts,tsx,js,jsx}': ['bun run check'],

  // Run type checking on TypeScript files
  '*.{ts,tsx}': () => 'bun run type-check',

  // Format other files
  '*.{json,md,yml,yaml}': ['bun run format'],
};
