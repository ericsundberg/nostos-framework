# AGENTS.md

## Purpose

This file defines how coding agents should work within this project. Follow these instructions unless a more specific `AGENTS.md` exists in a subdirectory.

## First Steps

Before changing code:

1. Read this file.
2. Read the project `README` and relevant configuration files.
3. Inspect the surrounding directory structure and related modules.
4. Identify the existing conventions for naming, formatting, testing, and error handling.
5. Confirm that the requested change is not already implemented elsewhere.

Do not assume the architecture from filenames alone. Read the code that controls the affected behavior.

## General Approach

- Make the smallest complete change that satisfies the request.
- Preserve existing behavior unless the task explicitly requires changing it.
- Prefer clear, maintainable solutions over clever or highly compressed code.
- Reuse existing systems and patterns before introducing new abstractions.
- Avoid unrelated refactors, dependency changes, or formatting churn.
- Do not invent requirements. When details are missing, use the safest reasonable interpretation and state any important assumption.

## Modular Code

Prefer modular code over long scripts or oversized files.

- Keep entry points and bootstrap scripts small.
- Move distinct responsibilities into focused modules.
- Prefer several clearly named files loaded by a bootstrap or entry point over one large script.
- Separate user interface, state, data access, configuration, and domain logic where practical.
- Extract reusable logic when it has a clear responsibility or is used in more than one place.
- Avoid premature fragmentation: a module should have a meaningful purpose, not exist only to reduce line count.
- Do not create circular dependencies.
- Keep public interfaces narrow and explicit.

When an existing file is becoming difficult to understand within an LLM context window, split it along responsibility boundaries rather than extending it indefinitely.

## Code Changes

- Match the language, style, and structure already used by the project.
- Use descriptive names and straightforward control flow.
- Add comments only where intent, constraints, or non-obvious behavior need explanation.
- Validate inputs at system boundaries.
- Handle errors explicitly; do not silently ignore failures.
- Avoid hard-coded paths, secrets, credentials, machine-specific values, or environment assumptions.
- Do not remove compatibility behavior unless the task requires it.
- Do not add dependencies when the standard library or an existing dependency is sufficient.

## Files and Scope

- Modify only files needed for the requested work.
- Do not edit generated files, lockfiles, vendored code, build output, or assets unless necessary.
- Do not move or rename files without a clear architectural reason.
- Preserve public-facing filenames, APIs, routes, save formats, and configuration keys unless a migration is part of the task.
- Check for a more specific `AGENTS.md` before working in a subdirectory.

## Testing and Verification

After making changes:

1. Run the most relevant targeted tests.
2. Run broader project checks when practical.
3. Verify formatting, linting, type checking, or compilation where applicable.
4. Test important user-facing paths affected by the change.
5. Report what was tested and any checks that could not be run.

Do not claim that a change works unless it was verified. If no automated tests exist, describe the manual verification performed.

## Safety and Data

- Never commit secrets, tokens, passwords, private keys, personal data, or local environment files.
- Do not perform destructive operations unless explicitly requested.
- Preserve user data and existing save or configuration files.
- Treat migrations, deletions, and irreversible changes as high risk.
- Create or update backups and migration paths when changing persistent data formats.

## Documentation

Update documentation when behavior, setup, configuration, commands, or public interfaces change. Keep documentation concise and place detailed explanations near the code or feature they describe.

Do not create extra planning or status documents inside the repository unless requested.

## Git and Change Reporting

- Keep changes focused and reviewable.
- Do not commit, push, merge, rebase, or change branches unless explicitly requested.
- Do not rewrite existing history.
- Summarize completed work by file or subsystem.
- Call out assumptions, compatibility concerns, untested areas, and follow-up work clearly.
