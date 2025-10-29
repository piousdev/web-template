/**
 * Commitlint Configuration
 * Enforces conventional commit messages with defined scopes
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(auth): add social login support
 *
 * @see https://commitlint.js.org
 * @see https://www.conventionalcommits.org
 */

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce defined scopes
    'scope-enum': [
      2,
      'always',
      [
        'auth', // Authentication related changes
        'db', // Database schema and queries
        'payments', // Payment integration (Polar)
        'storage', // File storage (R2)
        'email', // Email service
        'api', // API routes
        'ui', // UI components
        'i18n', // Internationalization
        'config', // Configuration files
        'tests', // Testing changes
        'deps', // Dependency updates
        'docs', // Documentation
        'ci', // CI/CD workflows
        'docker', // Docker configuration
      ],
    ],
    // Scope is required
    'scope-empty': [2, 'never'],
    // Type is required
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'revert', // Revert previous commit
        'build', // Build system or dependencies
        'ci', // CI/CD changes
      ],
    ],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be in lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Header max length (type + scope + subject)
    'header-max-length': [2, 'always', 100],
  },
};
