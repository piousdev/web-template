---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# CLAUDE CODE Research Protocol (FOLLOW STRICTLY)

## Before ANY implementation:

### 1. Verify Current Setup (DO THIS FIRST)
- [ ] Check package.json for versions
- [ ] Check package manager (bun.lockb = bun, not npm/npx)
- [ ] Check existing implementation of similar features
- [ ] Check environment variables in .env.example

### 2. Research Official Docs
For ANY library/framework you're about to use:
- [ ] Find official docs URL
- [ ] Verify API for OUR version (not latest, not outdated)
- [ ] Check migration guides if we're on older version
- [ ] Note any breaking changes

### 3. Analyze Existing Patterns
- [ ] Search codebase for similar implementations
- [ ] Identify our conventions (naming, structure, error handling)
- [ ] Flag any outdated/incorrect patterns found
- [ ] Propose fixes BEFORE adding new code

### 4. Ask Clarifying Questions
**ALWAYS ask when uncertain about:**
- Package manager (bun vs npm vs yarn)
- Currency (EUR vs USD)
- Timezone/locale defaults
- API endpoints structure
- Authentication flow
- Deployment target (Fly.io specifics)
- Feature scope ("add auth" - social? email? both?)

### 5. Propose, Don't Implement
Format: "I found X in docs, saw Y pattern in codebase, suggest Z approach. Proceed?"

## RED FLAGS (Stop and Ask):
- ❌ Using `npx` (we use bun)
- ❌ Adding $ for currency (confirm EUR/USD first)
- ❌ Assuming API exists (check routes first)
- ❌ Using deprecated patterns (verify against latest docs)
- ❌ Creating new pattern (check if we have existing one)
- ❌ Deleting code (explain why it's safe to delete)
- ❌ Breaking changes (list what breaks, how to migrate)

## Response Template:
```
**Research Done:**
1. Checked package.json: [library@version]
2. Official docs: [URL] - confirmed [API/pattern]
3. Existing code: Found [pattern] in [file]
4. Issues found: [any outdated/wrong code]

**Questions:**
- [Any assumptions I need to confirm]

**Proposed approach:**
- [What I'll do]
- [Why this way]
- [What might break]

Proceed?
```

## Project Documentation

This boilerplate includes comprehensive documentation to help you get started and understand the architecture:

### 📖 Essential Reading

1. **[docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md)** - **START HERE**
   - Source of truth for the entire project
   - Technology stack details and rationale
   - Business context and scale considerations
   - Architecture principles and patterns
   - Key decisions and trade-offs

2. **[docs/QUICK-START.md](docs/QUICK-START.md)** - **Getting Started**
   - Environment setup guide
   - Required services and API keys
   - Local development workflow
   - Common tasks and commands
   - Deployment instructions

3. **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)** - **Dependency Reference**
   - Complete list of all dependencies
   - Purpose and usage of each package
   - Safe removal guides for unused features
   - Alternative package suggestions

### 🎯 When to Reference

- **Before starting any feature**: Read PROJECT-CONTEXT.md to understand existing patterns
- **Setting up locally**: Follow QUICK-START.md step-by-step
- **Removing features**: Check DEPENDENCIES.md for safe removal instructions
- **Making architectural decisions**: Refer to principles in PROJECT-CONTEXT.md
