# Nostos Framework Architecture

Last updated: 2026-07-16
Project status: early pre-alpha framework/template
Primary runtime: Electron + PixiJS + TypeScript

## 1. Purpose

Nostos Framework is a forkable game framework and starter template for building tabletop-style digital games, classic RPG-inspired experiences, narrative systems, menus, save/load flows, settings, and reusable game infrastructure.

This repository is **not intended to be a finished game**. It is intended to be a clean base that can be forked, renamed, re-themed, and expanded into a standalone game project.

The architecture should prioritize:

* clear system boundaries;
* stable internal IDs instead of display text as logic keys;
* localization-ready UI and content;
* data-driven assets, music, and configuration;
* modular files that are easy for humans and LLM agents to inspect;
* reusable framework systems separated from game/template-facing code.

## 2. High-Level Runtime Model

Nostos runs as an Electron desktop application with a PixiJS renderer.

At a high level:

```text
Electron main process
    ├── Creates the BrowserWindow
    ├── Registers safe IPC handlers
    ├── Registers the game-asset:// protocol
    ├── Loads public config files from /config
    └── Loads/saves persistent user settings in Electron userData

Electron preload
    └── Exposes a narrow window.gamePlatform bridge

Renderer process
    ├── Shows an HTML/CSS startup screen while booting
    ├── Creates the PixiJS Application
    ├── Creates game services
    ├── Loads settings, localization, public data, and assets
    └── Routes between PixiJS scenes
```

The renderer should not access Node APIs directly. It should use the preload bridge exposed as `window.gamePlatform`.

## 3. Project Structure

```text
[Project Root]/
├── config/
│   └── settings.config.json
├── game-assets/
│   ├── audio/
│   │   └── music/
│   │       ├── music-manifest.json
│   │       └── *.ogg
│   ├── data/
│   │   ├── gameplay.json
│   │   └── title-screen.json
│   ├── fonts/
│   ├── images/
│   │   └── pipeline-marker.svg
│   ├── localization/
│   │   └── localization-en.json
│   └── manifest.json
├── src/
│   ├── core/
│   ├── electron/
│   ├── game/
│   ├── renderer/
│   └── shared/
├── tools/
│   ├── build_context.py
│   ├── build_context.sh
│   ├── build_context_settings.config
│   └── snapshots/
├── README.md
├── package.json
└── ARCHITECTURE.MD
```

## 4. Architectural Layers

### 4.1. `src/electron/`

Electron main-process and preload code live here.

Responsibilities:

* create the application window;
* enforce Electron security boundaries;
* register the custom asset protocol;
* register config/settings IPC handlers;
* expose a safe preload bridge;
* route app-level behavior such as quitting.

Important files:

| File                       | Purpose                                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/electron/main.ts`     | Electron entrypoint. Creates the `BrowserWindow`, registers protocols and IPC, and loads the renderer.          |
| `src/electron/preload.ts`  | Exposes `window.gamePlatform` through `contextBridge`. This is the renderer’s only bridge to platform services. |
| `src/electron/assets.ts`   | Registers and handles the `game-asset://assets/...` protocol for public game assets.                            |
| `src/electron/config.ts`   | Loads allowlisted public config files from `/config`.                                                           |
| `src/electron/settings.ts` | Loads and saves persistent user settings under Electron `userData`.                                             |

Boundary rule:

> Renderer/game code should use `window.gamePlatform`; it should not import Electron or Node APIs directly.

### 4.2. `src/shared/`

Shared types that are safe to reference across Electron/preload/renderer boundaries.

Important files:

| File                     | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `src/shared/platform.ts` | Defines the `GamePlatform` bridge exposed as `window.gamePlatform`. |

This layer should stay small and focused. It should not become a dumping ground for game systems.

### 4.3. `src/renderer/`

Browser-renderer startup code lives here.

Responsibilities:

* load global renderer CSS;
* show a DOM-based startup/loading/error screen before PixiJS is ready;
* call the game bootstrap entrypoint;
* cleanly report boot failures.

Important files:

| File                                     | Purpose                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/renderer/index.ts`                  | Renderer entrypoint. Shows `StartupScreen`, calls `startGame`, and handles fatal startup errors. |
| `src/renderer/startup/startup-screen.ts` | DOM startup/error screen displayed before the PixiJS app is fully initialized.                   |
| `src/renderer/styles/base.css`           | Global browser and startup-screen styling.                                                       |

The renderer layer should remain thin. Most game logic belongs in `src/game/` or reusable framework logic in `src/core/`.

### 4.4. `src/core/`

Reusable framework systems live here.

Responsibilities:

* provide generic systems that are not tied to one game’s content;
* keep reusable services small, typed, and testable;
* avoid depending on game-specific data, copy, or scene names.

Important directories:

| Directory               | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `src/core/application/` | PixiJS application creation.                                   |
| `src/core/assets/`      | Asset manifest loading and PixiJS asset bundle initialization. |
| `src/core/data/`        | Generic JSON asset loading and validation helpers.             |
| `src/core/input/`       | Input binding and pressed-action handling.                     |
| `src/core/scenes/`      | Generic scene interface and scene manager.                     |
| `src/core/settings/`    | Generic settings manager with storage abstraction.             |

Core systems should remain reusable. If a file knows about Nostos-specific scenes, menu labels, music rules, or gameplay data, it probably belongs in `src/game/`, not `src/core/`.

### 4.5. `src/game/`

Game/template-facing framework code lives here.

Responsibilities:

* wire reusable core systems into the current game template;
* define current scenes, menus, services, data types, music behavior, and settings types;
* load public game assets and content;
* provide an example game loop and template gameplay scene.

Important directories:

| Directory                | Purpose                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| `src/game/content/`      | Loads and groups public game content into a typed `GameContent` object.       |
| `src/game/data/`         | Runtime data interfaces and validators for JSON files in `game-assets/data/`. |
| `src/game/localization/` | Localization data loading, validation, and lookup service.                    |
| `src/game/menus/`        | PixiJS menu panels and reusable menu button components.                       |
| `src/game/music/`        | Music manifest types and rule-based music director.                           |
| `src/game/navigation/`   | Scene routing and high-level game flow.                                       |
| `src/game/scenes/`       | PixiJS scenes.                                                                |
| `src/game/services/`     | Game service container and runtime services.                                  |
| `src/game/settings/`     | Game settings schema, defaults, normalization, and public config validation.  |
| `src/game/systems/`      | Small gameplay systems such as player movement.                               |

Important files:

| File                                        | Purpose                                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/game/bootstrap.ts`                     | Game bootstrap entrypoint. Creates services and starts the router.                              |
| `src/game/build-version.ts`                 | Build/version value displayed in the title scene.                                               |
| `src/game/navigation/game-router.ts`        | High-level flow between launch, title, and gameplay scenes.                                     |
| `src/game/services/create-game-services.ts` | Creates the PixiJS app, settings manager, service container, music service, and input bindings. |
| `src/game/services/game-services.ts`        | Owns runtime services and central cleanup.                                                      |
| `src/game/settings/game-settings.ts`        | Defines settings shape, framework fallback defaults, and normalization.                         |
| `src/game/settings/load-settings-config.ts` | Loads public settings config via the platform bridge.                                           |
| `src/game/settings/settings-config.ts`      | Validates `config/settings.config.json`.                                                        |

## 5. Runtime Flow

### 5.1. Startup Flow

```text
src/renderer/index.ts
    └── creates StartupScreen
    └── calls startGame(document.body)

src/game/bootstrap.ts
    └── createGameServices(host)
    └── new GameRouter(services)
    └── router.start()

src/game/navigation/game-router.ts
    ├── loads localization first
    ├── checks settings.gameplay.showLaunchScreen
    ├── optionally shows LaunchScene
    ├── loads game content
    └── shows TitleScene
```

The DOM startup screen exists before PixiJS is ready. The PixiJS launch scene exists after core services are ready and is controlled by the saved/public gameplay setting `showLaunchScreen`.

### 5.2. Service Creation

`createGameServices()` is the main composition point for the game runtime.

It:

1. creates an asset URL resolver using `window.gamePlatform.assets.url`;
2. loads public settings config from `config/settings.config.json`;
3. merges project defaults with framework fallback settings;
4. creates a `SettingsManager<GameSettings>`;
5. loads persistent user settings;
6. creates the PixiJS `Application`;
7. creates `GameServices`;
8. binds configured input actions.

This is the correct place to add new top-level runtime services when they are needed by multiple scenes or systems.

### 5.3. Scene Management

Scenes implement the core `Scene` interface:

```ts
interface Scene {
  readonly view: Container;
  enter?(): void;
  exit?(): void;
  resize(width: number, height: number): void;
  update?(deltaMilliseconds: number): void;
  destroy?(): void;
}
```

`SceneManager` owns the active scene and handles:

* adding the scene view to the PixiJS stage;
* calling `enter`;
* forwarding ticker updates;
* forwarding resize events;
* calling `exit` and `destroy` when changing scenes.

Scene transitions should go through `SceneManager.show(...)`, usually from `GameRouter`.

## 6. Current Scene Model

### 6.1. `LaunchScene`

Purpose:

* developer-facing loading/boot screen;
* ensures a minimum visible loading duration;
* runs the async content-loading task;
* displays loading failures inside the PixiJS UI.

The launch scene is optional and controlled by `settings.gameplay.showLaunchScreen`.

### 6.2. `TitleScene`

Purpose:

* persistent title-screen scene;
* displays title art/text and build version;
* hosts menu panels;
* listens to settings to show/hide the pipeline marker.

The title scene owns the title-screen container and swaps menu panels inside its `menuHost`.

Current panels:

* `MainMenuPanel`;
* `LoadGamePanel`;
* `SettingsMenuPanel`.

### 6.3. `GameplayScene`

Purpose:

* current template gameplay scene;
* demonstrates movement, input bindings, settings subscription, localization, and JSON-driven gameplay data.

This is not intended to be a final game. It is a working scaffold for future gameplay systems.

### 6.4. `InputTestScene`

Purpose:

* developer/testing scene for input and settings behavior.

This scene is useful as a pattern or diagnostic tool, but it is not currently part of the main router flow.

## 7. Menu Architecture

Menus are PixiJS containers, not DOM UI.

Key abstractions:

| File                                     | Purpose                                        |
| ---------------------------------------- | ---------------------------------------------- |
| `src/game/menus/menu-panel.ts`           | Interface for menu panels.                     |
| `src/game/menus/menu-button.ts`          | Reusable PixiJS menu button.                   |
| `src/game/menus/main-menu-panel.ts`      | New/Continue/Load/Settings/Quit menu.          |
| `src/game/menus/load-game-panel.ts`      | Placeholder load-game panel.                   |
| `src/game/menus/settings-menu-panel.ts`  | Category-based settings panel.                 |
| `src/game/menus/settings-menu-format.ts` | Formatting and option helpers for settings UI. |
| `src/game/menus/settings-menu-screen.ts` | Settings screen and setting-key types.         |

Menu labels and descriptions should come from localization data whenever practical. Internal IDs should use stable keys such as `new_game`, `settings`, or `fps_limit`, not visible English display text.

## 8. Asset and Data Architecture

### 8.1. Public Asset Root

Runtime public assets live in:

```text
game-assets/
```

The Electron main process exposes them through:

```text
game-asset://assets/<relative-path>
```

The renderer gets URLs through:

```ts
window.gamePlatform.assets.url(relativePath)
```

The asset protocol handler should remain conservative:

* only GET requests are allowed;
* paths are decoded and normalized;
* invalid path segments are rejected by the preload bridge;
* path traversal is guarded against in the Electron main process;
* resolved real paths must remain inside the asset root.

### 8.2. PixiJS Asset Manifest

Top-level PixiJS asset bundles are declared in:

```text
game-assets/manifest.json
```

The current startup bundle includes:

```text
ui.pipeline-marker -> images/pipeline-marker.svg
```

The manifest is loaded by:

```text
src/core/assets/load-asset-manifest.ts
src/core/assets/initialize-asset-bundles.ts
```

Then `loadGameContent()` loads the `startup` bundle and validates that the expected texture exists.

### 8.3. JSON Data Assets

Game data lives under:

```text
game-assets/data/
```

Current files:

| File                                 | Runtime Type      |
| ------------------------------------ | ----------------- |
| `game-assets/data/gameplay.json`     | `GameplayData`    |
| `game-assets/data/title-screen.json` | `TitleScreenData` |

Data loading uses:

```text
src/core/data/load-json-asset.ts
```

Each JSON asset should have a matching TypeScript interface and validator. Do not trust JSON shape at runtime without validation.

### 8.4. Localization Assets

Localization lives under:

```text
game-assets/localization/
```

Current file:

```text
game-assets/localization/localization-en.json
```

Localization is loaded by:

```text
src/game/localization/load-localization.ts
```

and accessed through:

```text
src/game/localization/localization-service.ts
```

Player-facing strings should generally be localization keys, not hardcoded text.

### 8.5. Music Assets

Music files live under:

```text
game-assets/audio/music/
```

Music metadata lives in:

```text
game-assets/audio/music/music-manifest.json
```

The manifest defines:

* track IDs;
* file paths;
* optional track volumes;
* playlists;
* rules that map runtime context to playlists.

`MusicDirector` chooses music based on context such as:

```ts
{ screen: 'title' }
{ screen: 'game', combat: false }
{ screen: 'game', combat: true }
```

`MusicService` owns the actual `HTMLAudioElement` playback.

## 9. Config and Settings Architecture

Nostos has two distinct settings/config concepts.

### 9.1. Public Project Config

Public project config lives in:

```text
config/settings.config.json
```

It is loaded by Electron main-process code through an allowlisted IPC handler and consumed by renderer/game code through:

```ts
window.gamePlatform.config.load('settings.config.json')
```

This config defines:

* project default settings;
* allowed option lists for settings UI.

It should be safe to ship with the game.

### 9.2. Persistent User Settings

Persistent user settings are saved under Electron `userData`, currently in:

```text
game-data/settings.json
```

This file is user-local runtime state and should not be committed to the repository.

Persistent settings are loaded/saved through:

```text
src/electron/settings.ts
```

and normalized by:

```text
src/game/settings/game-settings.ts
```

### 9.3. Settings Fallback Order

The effective settings flow is:

```text
FRAMEWORK_FALLBACK_GAME_SETTINGS
    ↓ merged with
config/settings.config.json defaults
    ↓ normalized with
persistent user settings
```

This ensures old or malformed user settings do not break the app. Invalid or missing values fall back to known safe defaults.

### 9.4. Settings Categories

Current settings categories:

* gameplay;
* controls;
* display;
* graphics;
* audio;
* accessibility.

Current implemented settings UI includes:

* gameplay: pipeline marker and launch screen toggles;
* graphics: foreground FPS limit and background FPS limit;
* audio: saved volume and mute settings.

Display and accessibility categories exist as menu placeholders and should be implemented incrementally.

## 10. Input Architecture

Input is managed by:

```text
src/core/input/input-manager.ts
```

Input actions are stable strings such as:

```text
ui.confirm
ui.back
settings.toggleMarker
movement.left
movement.right
movement.up
movement.down
```

Bindings come from game settings:

```text
settings.controls.inputBindings
```

This allows keybindings to become configurable later without rewriting scene logic.

Rules:

* scene logic should check actions, not raw key codes;
* default bindings should live in framework/project settings;
* new input actions should use stable, descriptive IDs.

## 11. Audio and Music Architecture

The current audio architecture has two layers:

| Layer                      | File                                 | Responsibility                                                                               |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Low-level playback         | `src/game/services/music-service.ts` | Owns `HTMLAudioElement`, playback, looping, stop/destroy, and browser autoplay unlock retry. |
| Rule-based music selection | `src/game/music/music-director.ts`   | Selects playlists/tracks from manifest rules based on runtime context.                       |

Music settings currently exist and are saved, but full runtime mixing behavior is not yet wired through the saved audio settings. Future work should connect `masterVolume`, `musicVolume`, mute behavior, and focus behavior to runtime audio playback.

## 12. Frame Rate Architecture

Frame-rate behavior is handled by:

```text
src/game/services/frame-rate-service.ts
```

It subscribes to settings and applies:

* `graphics.fpsLimit` when foregrounded;
* `graphics.backgroundFpsLimit` when hidden or unfocused.

Important convention:

* `fpsLimit = 0` means unlimited foreground FPS;
* background FPS defaults to a positive number, currently 30.

## 13. Version Display

The in-game title-screen version comes from:

```text
src/game/build-version.ts
```

The package/GitHub-facing version comes from:

```text
package.json
```

When updating the framework version, keep both version sources in sync so the package version and in-game displayed version match.

## 14. Validation and Testing

The project uses npm scripts for validation and testing.

Important scripts:

```text
npm run lint
npm test
npm run validate:assets
npm run validate:config
npm run check
```

Current meaning:

| Script            | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `lint`            | Run ESLint on TypeScript files.                           |
| `test`            | Run Vitest tests.                                         |
| `validate:assets` | Validate public game assets and manifests.                |
| `validate:config` | Validate public config files.                             |
| `check`           | Run lint, tests, asset validation, and config validation. |
| `prestart`        | Validate assets and config before starting.               |
| `prepackage`      | Run full check before packaging.                          |

Before committing meaningful code changes, prefer running:

```text
npm run check
```

For narrower changes, run the relevant subset.

## 15. Build Context Tooling

The repository includes a local LLM context tool under:

```text
tools/
```

Important files:

| File                                  | Purpose                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tools/build_context.py`              | Generates an LLM-friendly source/context snapshot.                                                           |
| `tools/build_context_settings.config` | Configures which roots the snapshot includes.                                                                |
| `tools/build_context.sh`              | Shell launcher for terminal or file-browser use.                                                             |
| `tools/snapshots/`                    | Generated context snapshots. Generated `.txt` snapshots should not be committed unless intentionally needed. |

The build context snapshot should include:

```text
src/
game-assets/
config/
```

It should skip binary/media/low-context files such as `.ogg`, images, fonts, archives, generated output, and possible secret files.

This snapshot is for exact current code evidence. This architecture document is for stable conceptual orientation.

## 16. Source of Truth Rules

Use the following source-of-truth hierarchy:

1. Current code and config files.
2. Runtime validators and TypeScript types.
3. `ARCHITECTURE.MD` for stable architectural intent.
4. `README.md` for public project goals and philosophy.
5. Generated context snapshots for LLM review.

Do not treat generated snapshots as maintained design documentation. Do not treat this architecture document as proof that a file exists if the current codebase says otherwise.

## 17. Extension Guidelines

### 17.1. Adding a New Scene

When adding a new scene:

1. create a focused scene file in `src/game/scenes/`;
2. implement the core `Scene` interface;
3. inject dependencies through constructor options;
4. use `InputManager` actions, not raw key handlers when possible;
5. use localization keys for visible text;
6. route to it through `GameRouter` or a future router/state system;
7. clean up listeners in `exit()` or `destroy()`.

### 17.2. Adding a New Menu Panel

When adding a new menu panel:

1. place it in `src/game/menus/`;
2. implement `MenuPanel`;
3. use `MenuButton` or a similarly reusable component;
4. use stable IDs for menu entries;
5. get labels/descriptions from `LocalizationService`;
6. unsubscribe input listeners in `exit()`;
7. destroy PixiJS children in `destroy()`.

### 17.3. Adding New Public JSON Data

When adding new JSON data:

1. place data under `game-assets/data/` or a more specific asset subdirectory;
2. include `schemaVersion`;
3. create a TypeScript interface;
4. create a runtime validator;
5. load through `loadJsonAsset`;
6. include useful validation errors;
7. update validation scripts if necessary.

### 17.4. Adding New Settings

When adding a new setting:

1. update `GameSettings`;
2. update `FRAMEWORK_FALLBACK_GAME_SETTINGS`;
3. update `normalizeGameSettings`;
4. update `config/settings.config.json`;
5. update `SettingsConfig` validation if public config supports options for the setting;
6. update settings UI only after the setting is normalized and persisted correctly;
7. add localization keys for labels and descriptions.

### 17.5. Adding New Assets

When adding new assets:

1. place assets under `game-assets/`;
2. use the asset manifest when PixiJS needs to load them as textures or bundles;
3. reference runtime paths relative to `game-assets/`;
4. validate manifest entries;
5. avoid hardcoded file paths in scene logic.

### 17.6. Adding New Music

When adding music:

1. place audio files under `game-assets/audio/music/`;
2. add track entries to `music-manifest.json`;
3. add or update playlists;
4. add or update rules;
5. update runtime context calls in `GameRouter` or gameplay systems;
6. confirm behavior with browser autoplay restrictions in mind.

## 18. Security and Safety Boundaries

Electron security posture matters.

Current design expectations:

* keep `contextIsolation` enabled;
* keep `nodeIntegration` disabled;
* keep renderer sandboxing enabled;
* do not expose raw filesystem access to the renderer;
* keep preload APIs narrow and typed;
* allowlist public config filenames;
* validate all public JSON data;
* guard against path traversal in asset loading;
* avoid storing secrets in public config or game assets.

Files under `game-assets/` and `config/` are public game resources. Do not place secrets there.

## 19. Naming and Style Conventions

General conventions:

* TypeScript source files use kebab-case filenames.
* Runtime classes and interfaces use PascalCase.
* Stable runtime IDs use lowercase snake_case or dotted action names depending on domain.
* Localization keys use lowercase snake_case.
* Input actions use dotted names such as `movement.left`.
* Config/data files should include a `schemaVersion`.
* Prefer small modules over large files.

Examples:

```text
new_game
load_game
settings_coming_soon
movement.left
ui.confirm
settings.toggleMarker
```

## 20. Agent Guidance

Agents working on this repository should follow these rules:

* Do not assume paths, filenames, or casing. Verify them from the current snapshot or filesystem.
* Do not patch directly on `main` for risky or multi-file changes. Create a branch first.
* Prefer full-file replacements or precise edit instructions over vague patches.
* Preserve behavior unless the task explicitly asks to change it.
* Keep systems modular.
* Avoid Bash-only interactive syntax in commands intended for Eric’s fish shell.
* Use fish-compatible commands unless explicitly wrapping with `bash -c` or writing a script file.
* Run appropriate checks after code changes.
* Update architecture/docs when changing architectural boundaries, data flow, or runtime responsibilities.
* Update version sources together when bumping the project version.

## 21. Known Current Gaps / Roadmap Areas

Current or expected future areas include:

* save/load system implementation;
* continue-game availability and save detection;
* full display settings behavior;
* full accessibility settings behavior;
* runtime audio mixing tied to saved audio settings;
* SFX/UI audio services;
* richer scene routing or game-state management;
* HTML5/itch.io demo build strategy;
* packaging validation for `game-assets/` and `config/`;
* more robust asset and config schema validation;
* documentation for forking/renaming a game built from the framework.

## 22. Glossary

| Term                | Meaning                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework           | Reusable infrastructure intended to be forked into games.                                                             |
| Template            | Developer-facing starter content that demonstrates framework systems.                                                 |
| Scene               | A PixiJS screen/state implementing the core `Scene` interface.                                                        |
| Menu panel          | A PixiJS container hosted inside a scene, usually the title scene.                                                    |
| Game services       | Runtime service container holding app, input, scenes, settings, music, content, localization, and platform functions. |
| Public config       | Versioned JSON config shipped with the app under `/config`.                                                           |
| Persistent settings | User-specific settings saved under Electron `userData`.                                                               |
| Asset manifest      | JSON file that declares PixiJS asset bundles.                                                                         |
| Music manifest      | JSON file that declares music tracks, playlists, and context rules.                                                   |
| Stable ID           | Internal identifier that should not change merely because visible text changes.                                       |
| Localization key    | Stable key used to look up visible text and descriptions.                                                             |

