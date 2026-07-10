# Nostos Framework

**Nostos Framework** is a forkable game framework and starter template for building tabletop-style digital games, classic RPG-inspired experiences, narrative systems, menus, saves, settings, and reusable game infrastructure.

The project is intended to be a **base for new games**, not a finished game itself. Developers should be able to fork it, rename it, replace the content, and build an independent project on top of the shared systems.

## Why “Nostos”?

*Nostos* is an ancient Greek idea meaning a return home, a journey back, or a homecoming.

The framework is especially inspired by:

* Tabletop roleplaying games
* Classic computer RPGs
* Menu-driven strategy and simulation games
* Narrative-heavy games with durable choices
* Developer-friendly templates that can be forked into many different projects

## Project Goals

Nostos Framework aims to provide a clean foundation for games that need:

* A structured main menu and screen routing system
* New game, continue, load game, settings, credits, and quit flows
* Save/load support
* Localization-ready text
* Stable object identifiers
* Reusable UI components
* Settings systems for display, audio, graphics, and accessibility
* Developer-facing test content and context clues
* A modular codebase that is easier for future developers and AI agents to extend

This framework should prefer **clear systems over hardcoded one-off behavior**.

## Framework Philosophy

Nostos is built around a few core principles.

### 1. Forkability

This project should be easy to copy and turn into a new game. Game-specific content should be replaceable without rewriting the core systems.

### 2. Stable Internal IDs

Objects, buttons, screens, actions, items, settings, and descriptions should use stable internal identifiers.

For example, a main menu button should not be internally identified by its English display text:

```ts
"New Game"
```

Instead, it should use a stable key:

```ts
new_game
```

The visible text should come from localization data:

```json
{
  "new_game": "New Game"
}
```

This allows the same internal system to support multiple languages, alternate wording, tooltips, descriptions, accessibility labels, and future content edits.

### 3. Localization-First Design

Player-facing text should be stored in localization files whenever practical.

This includes:

* Menu labels
* Button text
* Tooltips
* Descriptions
* Settings labels
* Error messages
* Developer-facing placeholder copy where appropriate

Hardcoded display text should be avoided in reusable systems.

### 4. Modular Code

Prefer smaller, focused files over long scripts. A future developer should be able to inspect one system at a time without reading the entire project.

Good candidates for modularization include:

* Menu definitions
* Screen components
* Localization files
* Settings definitions
* Save/load logic
* Audio/music systems
* Input handling
* Asset validation
* Game state defaults
* Developer test fixtures

### 5. Developer Context Is Useful

Because this is a framework and template, test-stage clues are welcome. Placeholder screens, labels, and UI hints can help developers understand how systems are intended to work before replacing them with final game content.

## Current Status

Nostos Framework is in an early development stage.

Current emphasis:

* Core project structure
* Main menu flow
* Localization-ready UI architecture
* Save/load scaffolding
* Settings architecture
* Asset validation
* Test coverage
* Developer-friendly conventions

Expect APIs, file names, and implementation details to change as the framework matures.

## Suggested Main Menu Structure

The default starter menu should include:

* `new_game`
* `continue_game`
* `load_game`
* `settings`
* `credits`
* `quit`

These should be treated as internal IDs. Their display names should come from localization files.

Example English localization:

```json
{
  "main_menu": {
    "new_game": "New Game",
    "continue_game": "Continue",
    "load_game": "Load Game",
    "settings": "Settings",
    "credits": "Credits",
    "quit": "Quit"
  }
}
```

A different localization file could restyle or translate these without changing the underlying menu logic.

## Development

Install dependencies:

```sh
npm install
```

Run the project:

```sh
npm run dev
```

Run the full project check:

```sh
npm run check
```

The full check should include linting, tests, and asset validation.

Depending on the current package scripts, individual checks may include:

```sh
npm run lint
npm test
npm run validate:assets
```

## Recommended Development Workflow

Before committing changes:

1. Run the project locally.
2. Test the changed screen or system manually.
3. Run the automated checks.
4. Confirm localization keys are used for new player-facing text.
5. Confirm new systems are modular and reusable.
6. Commit with a clear summary of the framework-level change.

## Project Structure

The exact structure may evolve, but the framework should generally separate:

```text
src/
  assets/
  components/
  data/
  game/
  localization/
  screens/
  state/
  styles/
  systems/
  tests/
```

Suggested responsibilities:

* `assets/` — fonts, images, audio, and other packaged assets
* `components/` — reusable UI components
* `data/` — game definitions, menus, content data, and configuration
* `game/` — core game-specific systems
* `localization/` — language files and text lookup utilities
* `screens/` — main menu, load game, settings, credits, and gameplay screens
* `state/` — default game state and state management
* `styles/` — global styles, layout, screen-specific styles
* `systems/` — reusable framework systems such as saves, settings, audio, and routing
* `tests/` — automated tests for framework behavior

## Localization Conventions

Use stable `snake_case` keys for internal IDs.

Good:

```ts
new_game
continue_game
load_game
settings
credits
quit
```

Avoid using display text as logic:

```ts
"New Game"
"Continue"
"Load Game"
```

Recommended pattern:

```ts
{
  id: "new_game",
  labelKey: "main_menu.new_game",
  action: "start_new_game"
}
```

This keeps the internal object stable while allowing the visible label to change.

## Settings System Goals

The settings system should eventually support:

* Display mode
* Resolution/window options
* Graphics quality
* Audio volume
* Music volume
* Sound effects volume
* Text speed
* Accessibility options
* Input preferences
* Language selection

Settings should be stored in a reusable framework-level system so individual games can inherit and extend them.

## Save/Load System Goals

The save/load system should eventually support:

* New game creation
* Continue most recent save
* Manual load game screen
* Save metadata
* Save versioning
* Migration-safe save data
* Game-specific save extensions

The load game screen should remain available even when no saves exist, so developers can test and style the flow consistently.

## Asset Philosophy

Assets should be organized in predictable locations and validated where possible.

Font files, images, audio, and other packaged content should use simple, stable filenames. Styling should refer to reusable role variables rather than hardcoding one-off font or asset names throughout the codebase.

Example:

```css
:root {
  --font-body: var(--font-akshar);
  --font-header: var(--font-platypi);
}
```

## Testing

Automated tests should protect framework behavior, especially:

* Menu routing
* Localization lookup
* Settings defaults
* Save/load state
* Asset validation
* Music/audio data
* Game state initialization

Run:

```sh
npm run check
```

before merging or publishing changes.

## Naming New Games Built With Nostos

A game forked from this framework should replace the project title, branding, content, and game-specific data. The Nostos name can remain in developer documentation or framework internals where useful, but the player-facing game should have its own identity.

## License

License information should be added before public release.

## Roadmap

Near-term priorities:

* Finalize localization key conventions
* Refactor player-facing text out of hardcoded UI
* Expand main menu behavior
* Build out settings screens
* Strengthen save/load architecture
* Improve developer-facing placeholder content
* Continue test coverage for framework systems

Longer-term priorities:

* Multiple language support
* Reusable RPG-style data structures
* Dialogue and narrative systems
* Character and party systems
* Inventory/item systems
* Quest or objective tracking
* Campaign/scenario templates
* Better developer tooling
* Starter content examples

## Summary

Nostos Framework is a foundation for building choice-driven, tabletop-inspired, classic RPG-adjacent games. It should remain modular, readable, localization-ready, and easy to fork into new projects.

The goal is not to build one game here.

The goal is to build the place many games can begin from.

