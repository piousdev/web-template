#!/usr/bin/env bun

import { watch } from 'fs';
import { join } from 'path';
import { mergeTranslationFiles } from './merge';

const SRC_DIR = join(process.cwd(), 'src');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let mergeTimeout: Timer | null = null;
let isProcessing = false;

/**
 * Debounced merge function to avoid multiple triggers
 */
async function debouncedMerge() {
  if (mergeTimeout) {
    clearTimeout(mergeTimeout);
  }

  mergeTimeout = setTimeout(async () => {
    if (isProcessing) return;

    isProcessing = true;
    try {
      await mergeTranslationFiles();
    } catch (error) {
      log(`\n❌ Error during merge: ${error}`, 'yellow');
    } finally {
      isProcessing = false;
    }
  }, 300); // 300ms debounce
}

/**
 * Watch for changes in locale files
 */
async function watchTranslations() {
  log('\n👀 Watching translation files for changes...', 'cyan');
  log('━'.repeat(50), 'cyan');
  log('Press Ctrl+C to stop\n', 'cyan');

  // Run initial merge
  await mergeTranslationFiles();

  // Watch src directory for locale file changes
  const watcher = watch(
    SRC_DIR,
    { recursive: true },
    async (eventType, filename) => {
      if (!filename) return;

      // Only watch locale/*.json files
      if (filename.includes('locale') && filename.endsWith('.json')) {
        log(`\n📝 Detected change: ${filename}`, 'yellow');
        await debouncedMerge();
      }
    }
  );

  // Handle process termination
  process.on('SIGINT', () => {
    log('\n\n👋 Stopping translation watcher...', 'cyan');
    watcher.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    watcher.close();
    process.exit(0);
  });
}

// Execute if run directly
if (import.meta.main) {
  watchTranslations().catch((error) => {
    console.error('Error starting watcher:', error);
    process.exit(1);
  });
}

export { watchTranslations };
