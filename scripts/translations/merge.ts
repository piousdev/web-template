#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative, dirname, sep } from 'path';
import { glob } from 'glob';

// Configuration
const SRC_DIR = join(process.cwd(), 'src');
const MESSAGES_DIR = join(process.cwd(), 'messages');
const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'nl', 'pt'];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TranslationFile {
  path: string;
  locale: string;
  namespace: string;
  content: Record<string, any>;
}

interface ValidationError {
  type: 'missing_locale' | 'invalid_json' | 'key_conflict' | 'unused_key';
  message: string;
  file?: string;
  locale?: string;
}

/**
 * Log colored message to console
 */
function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Generate namespace from file path
 * Example: src/components/button/locale/en.json -> components.button
 */
function generateNamespace(filePath: string): string {
  const relativePath = relative(SRC_DIR, filePath);
  const parts = relativePath.split(sep);

  // Remove 'locale' and filename from path
  const namespaceParts = parts.slice(0, -2);

  return namespaceParts.join('.');
}

/**
 * Find all locale JSON files in src directory
 */
async function findLocaleFiles(): Promise<string[]> {
  const pattern = join(SRC_DIR, '**/locale/*.json');
  return await glob(pattern);
}

/**
 * Parse JSON file safely
 */
function parseJsonFile(filePath: string): { success: boolean; data?: any; error?: string } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract locale from filename (e.g., en.json -> en)
 */
function extractLocale(filePath: string): string | null {
  const filename = filePath.split(sep).pop();
  if (!filename) return null;

  const locale = filename.replace('.json', '');
  return SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * Load and validate all translation files
 */
async function loadTranslationFiles(): Promise<{
  files: TranslationFile[];
  errors: ValidationError[]
}> {
  const errors: ValidationError[] = [];
  const files: TranslationFile[] = [];
  const localeFiles = await findLocaleFiles();

  // Group files by their parent directory (component)
  const componentGroups = new Map<string, Map<string, string>>();

  for (const filePath of localeFiles) {
    const locale = extractLocale(filePath);
    if (!locale) {
      errors.push({
        type: 'invalid_json',
        message: `Invalid locale filename: ${filePath}`,
        file: filePath,
      });
      continue;
    }

    // Parse JSON
    const parseResult = parseJsonFile(filePath);
    if (!parseResult.success) {
      errors.push({
        type: 'invalid_json',
        message: `Invalid JSON in ${filePath}: ${parseResult.error}`,
        file: filePath,
        locale,
      });
      continue;
    }

    const namespace = generateNamespace(filePath);
    const componentDir = dirname(dirname(filePath)); // Remove /locale/filename

    // Track which locales exist for each component
    if (!componentGroups.has(componentDir)) {
      componentGroups.set(componentDir, new Map());
    }
    componentGroups.get(componentDir)!.set(locale, filePath);

    files.push({
      path: filePath,
      locale,
      namespace,
      content: parseResult.data,
    });
  }

  // Validate: Each component must have all locales
  for (const [componentDir, localeMap] of componentGroups.entries()) {
    const existingLocales = Array.from(localeMap.keys());
    const missingLocales = SUPPORTED_LOCALES.filter(
      (locale) => !existingLocales.includes(locale)
    );

    if (missingLocales.length > 0) {
      errors.push({
        type: 'missing_locale',
        message: `Component at ${relative(process.cwd(), componentDir)} is missing locales: ${missingLocales.join(', ')}`,
        file: componentDir,
      });
    }
  }

  return { files, errors };
}

/**
 * Merge translation files by locale
 */
function mergeTranslations(files: TranslationFile[]): {
  merged: Map<string, Record<string, any>>;
  errors: ValidationError[];
} {
  const merged = new Map<string, Record<string, any>>();
  const errors: ValidationError[] = [];
  const keyRegistry = new Map<string, Map<string, string>>(); // locale -> key -> file

  // Initialize empty objects for each locale
  for (const locale of SUPPORTED_LOCALES) {
    merged.set(locale, {});
    keyRegistry.set(locale, new Map());
  }

  // Group files by locale
  const filesByLocale = new Map<string, TranslationFile[]>();
  for (const file of files) {
    if (!filesByLocale.has(file.locale)) {
      filesByLocale.set(file.locale, []);
    }
    filesByLocale.get(file.locale)!.push(file);
  }

  // Merge translations for each locale
  for (const [locale, localeFiles] of filesByLocale.entries()) {
    const mergedData = merged.get(locale)!;
    const registry = keyRegistry.get(locale)!;

    for (const file of localeFiles) {
      const { namespace, content, path } = file;

      // Create nested object structure
      const keys = namespace.split('.');
      let current = mergedData;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (i === keys.length - 1) {
          // Last key - check for conflicts
          if (current[key] !== undefined) {
            const existingFile = registry.get(`${namespace}`);
            errors.push({
              type: 'key_conflict',
              message: `Key conflict for namespace "${namespace}" in locale "${locale}":\n  - ${existingFile}\n  - ${path}`,
              file: path,
              locale,
            });
            continue;
          }

          // Set the translation content
          current[key] = content;
          registry.set(namespace, path);
        } else {
          // Intermediate key - create nested object
          if (current[key] === undefined) {
            current[key] = {};
          } else if (typeof current[key] !== 'object') {
            errors.push({
              type: 'key_conflict',
              message: `Cannot create namespace "${keys.slice(0, i + 1).join('.')}" - key already exists as a value in locale "${locale}"`,
              file: path,
              locale,
            });
            break;
          }
          current = current[key];
        }
      }
    }
  }

  return { merged, errors };
}

/**
 * Write merged translations to files
 */
function writeTranslations(merged: Map<string, Record<string, any>>): void {
  // Create messages directory if it doesn't exist
  if (!existsSync(MESSAGES_DIR)) {
    mkdirSync(MESSAGES_DIR, { recursive: true });
  }

  for (const [locale, content] of merged.entries()) {
    const filePath = join(MESSAGES_DIR, `${locale}.json`);
    const jsonContent = JSON.stringify(content, null, 2);
    writeFileSync(filePath, jsonContent + '\n', 'utf-8');
    log(`✓ Generated ${locale}.json`, 'green');
  }
}

/**
 * Main merge function
 */
async function mergeTranslationFiles(): Promise<boolean> {
  log('\n🌐 Merging translation files...', 'cyan');
  log('━'.repeat(50), 'cyan');

  // Load and validate all translation files
  const { files, errors: loadErrors } = await loadTranslationFiles();

  if (loadErrors.length > 0) {
    log('\n❌ Validation errors found:', 'red');
    for (const error of loadErrors) {
      log(`  ${error.message}`, 'red');
    }
    return false;
  }

  if (files.length === 0) {
    log('\n⚠️  No translation files found. Skipping merge.', 'yellow');
    return true;
  }

  log(`\n📄 Found ${files.length} translation files`, 'blue');

  // Merge translations
  const { merged, errors: mergeErrors } = mergeTranslations(files);

  if (mergeErrors.length > 0) {
    log('\n❌ Merge errors found:', 'red');
    for (const error of mergeErrors) {
      log(`  ${error.message}`, 'red');
    }
    return false;
  }

  // Write merged translations
  log('\n📝 Writing merged translations...', 'blue');
  writeTranslations(merged);

  log('\n✅ Translation merge completed successfully!', 'green');
  log('━'.repeat(50), 'cyan');

  return true;
}

// Execute if run directly
if (import.meta.main) {
  const success = await mergeTranslationFiles();
  process.exit(success ? 0 : 1);
}

export { mergeTranslationFiles };
