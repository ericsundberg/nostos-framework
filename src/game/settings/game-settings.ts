export type WindowMode =
  | 'windowed'
  | 'fullscreen'
  | 'borderless';

export type PowerPreference =
  | 'default'
  | 'high-performance'
  | 'low-power';

export type ColorblindMode =
  | 'off'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia';

export type RenderScale =
  | 'auto'
  | number;

export interface GameSettings {
  gameplay: {
    showLaunchScreen: boolean;
    showPipelineMarker: boolean;
    pauseWhenUnfocused: boolean;
    confirmBeforeQuit: boolean;
  };

  controls: {
    inputBindings: Record<string, string[]>;
  };

  display: {
    windowMode: WindowMode;
    resolution: string;
    displayId: string;
    rememberWindowPosition: boolean;
  };

  graphics: {
    fpsLimit: number;
    backgroundFpsLimit: number;
    renderScale: RenderScale;
    antialias: boolean;
    roundPixels: boolean;
    powerPreference: PowerPreference;
  };

  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    uiVolume: number;
    muteAll: boolean;
    muteWhenUnfocused: boolean;
  };

  accessibility: {
    reducedMotion: boolean;
    screenShake: boolean;
    flashingEffects: boolean;
    highContrast: boolean;
    largeText: boolean;
    textScale: number;
    colorblindMode: ColorblindMode;
  };
}

export const FRAMEWORK_FALLBACK_GAME_SETTINGS:
  GameSettings = {
    gameplay: {
      showLaunchScreen: true,
      showPipelineMarker: true,
      pauseWhenUnfocused: false,
      confirmBeforeQuit: true,
    },

    controls: {
      inputBindings: {
        'ui.confirm': [
          'Enter',
          'Space',
        ],

        'ui.back': [
          'Escape',
        ],

        'settings.toggleMarker': [
          'KeyM',
        ],

        'movement.left': [
          'KeyA',
          'ArrowLeft',
        ],

        'movement.right': [
          'KeyD',
          'ArrowRight',
        ],

        'movement.up': [
          'KeyW',
          'ArrowUp',
        ],

        'movement.down': [
          'KeyS',
          'ArrowDown',
        ],
      },
    },

    display: {
      windowMode: 'windowed',
      resolution: 'auto',
      displayId: 'primary',
      rememberWindowPosition: true,
    },

    graphics: {
      fpsLimit: 0,
      backgroundFpsLimit: 30,
      renderScale: 'auto',
      antialias: true,
      roundPixels: false,
      powerPreference: 'default',
    },

    audio: {
      masterVolume: 1,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      uiVolume: 0.8,
      muteAll: false,
      muteWhenUnfocused: false,
    },

    accessibility: {
      reducedMotion: false,
      screenShake: true,
      flashingEffects: true,
      highContrast: false,
      largeText: false,
      textScale: 1,
      colorblindMode: 'off',
    },
  };

export const DEFAULT_GAME_SETTINGS =
  FRAMEWORK_FALLBACK_GAME_SETTINGS;

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isNonEmptyString = (
  value: unknown,
): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0;

const isFiniteNumber = (
  value: unknown,
): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value);

const isPositiveNumber = (
  value: unknown,
): value is number =>
  isFiniteNumber(value) &&
  value > 0;

const isNonNegativeNumber = (
  value: unknown,
): value is number =>
  isFiniteNumber(value) &&
  value >= 0;

const isWindowMode = (
  value: unknown,
): value is WindowMode =>
  value === 'windowed' ||
  value === 'fullscreen' ||
  value === 'borderless';

const isPowerPreference = (
  value: unknown,
): value is PowerPreference =>
  value === 'default' ||
  value === 'high-performance' ||
  value === 'low-power';

const isColorblindMode = (
  value: unknown,
): value is ColorblindMode =>
  value === 'off' ||
  value === 'protanopia' ||
  value === 'deuteranopia' ||
  value === 'tritanopia';

const isRenderScale = (
  value: unknown,
): value is RenderScale =>
  value === 'auto' ||
  isPositiveNumber(value);

const normalizeVolume = (
  value: unknown,
  fallback: number,
): number => {
  if (
    !isFiniteNumber(value) ||
    value < 0 ||
    value > 1
  ) {
    return fallback;
  }

  return value;
};

const normalizeInputBindings = (
  value: unknown,
  defaults: Record<string, string[]>,
): Record<string, string[]> => {
  if (!isRecord(value)) {
    return {
      ...defaults,
    };
  }

  const normalized:
    Record<string, string[]> = {
      ...defaults,
    };

  for (const [
    action,
    codes,
  ] of Object.entries(value)) {
    if (
      !isNonEmptyString(action) ||
      !Array.isArray(codes) ||
      codes.length === 0 ||
      !codes.every(isNonEmptyString)
    ) {
      continue;
    }

    normalized[action] = [
      ...codes,
    ];
  }

  return normalized;
};

const getLegacyGameplayOverrides = (
  value: Record<string, unknown>,
): Partial<GameSettings['gameplay']> => {
  const overrides:
    Partial<GameSettings['gameplay']> = {};

  if (
    typeof value.showLaunchScreen ===
    'boolean'
  ) {
    overrides.showLaunchScreen =
      value.showLaunchScreen;
  }

  if (
    typeof value.showPipelineMarker ===
    'boolean'
  ) {
    overrides.showPipelineMarker =
      value.showPipelineMarker;
  }

  return overrides;
};

export const normalizeGameSettings = (
  value: unknown,
  defaults: GameSettings =
    FRAMEWORK_FALLBACK_GAME_SETTINGS,
): GameSettings => {
  const normalizedDefaults =
    value === defaults
      ? FRAMEWORK_FALLBACK_GAME_SETTINGS
      : normalizeGameSettings(
        defaults,
        FRAMEWORK_FALLBACK_GAME_SETTINGS,
      );

  if (!isRecord(value)) {
    return {
      ...normalizedDefaults,

      gameplay: {
        ...normalizedDefaults.gameplay,
      },

      controls: {
        inputBindings: {
          ...normalizedDefaults.controls
            .inputBindings,
        },
      },

      display: {
        ...normalizedDefaults.display,
      },

      graphics: {
        ...normalizedDefaults.graphics,
      },

      audio: {
        ...normalizedDefaults.audio,
      },

      accessibility: {
        ...normalizedDefaults.accessibility,
      },
    };
  }

  const gameplay =
    isRecord(value.gameplay)
      ? value.gameplay
      : {};

  const controls =
    isRecord(value.controls)
      ? value.controls
      : {};

  const display =
    isRecord(value.display)
      ? value.display
      : {};

  const graphics =
    isRecord(value.graphics)
      ? value.graphics
      : {};

  const audio =
    isRecord(value.audio)
      ? value.audio
      : {};

  const accessibility =
    isRecord(value.accessibility)
      ? value.accessibility
      : {};

  const legacyGameplay =
    getLegacyGameplayOverrides(value);

  return {
    gameplay: {
      showLaunchScreen:
        typeof gameplay.showLaunchScreen ===
        'boolean'
          ? gameplay.showLaunchScreen
          : legacyGameplay.showLaunchScreen ??
            normalizedDefaults.gameplay
              .showLaunchScreen,

      showPipelineMarker:
        typeof gameplay.showPipelineMarker ===
        'boolean'
          ? gameplay.showPipelineMarker
          : legacyGameplay.showPipelineMarker ??
            normalizedDefaults.gameplay
              .showPipelineMarker,

      pauseWhenUnfocused:
        typeof gameplay.pauseWhenUnfocused ===
        'boolean'
          ? gameplay.pauseWhenUnfocused
          : normalizedDefaults.gameplay
            .pauseWhenUnfocused,

      confirmBeforeQuit:
        typeof gameplay.confirmBeforeQuit ===
        'boolean'
          ? gameplay.confirmBeforeQuit
          : normalizedDefaults.gameplay
            .confirmBeforeQuit,
    },

    controls: {
      inputBindings:
        normalizeInputBindings(
          controls.inputBindings,
          normalizedDefaults.controls
            .inputBindings,
        ),
    },

    display: {
      windowMode:
        isWindowMode(display.windowMode)
          ? display.windowMode
          : normalizedDefaults.display
            .windowMode,

      resolution:
        isNonEmptyString(display.resolution)
          ? display.resolution
          : normalizedDefaults.display
            .resolution,

      displayId:
        isNonEmptyString(display.displayId)
          ? display.displayId
          : normalizedDefaults.display
            .displayId,

      rememberWindowPosition:
        typeof display.rememberWindowPosition ===
        'boolean'
          ? display.rememberWindowPosition
          : normalizedDefaults.display
            .rememberWindowPosition,
    },

    graphics: {
      fpsLimit:
        isNonNegativeNumber(
          graphics.fpsLimit,
        )
          ? graphics.fpsLimit
          : normalizedDefaults.graphics
            .fpsLimit,

      backgroundFpsLimit:
        isPositiveNumber(
          graphics.backgroundFpsLimit,
        )
          ? graphics.backgroundFpsLimit
          : normalizedDefaults.graphics
            .backgroundFpsLimit,

      renderScale:
        isRenderScale(graphics.renderScale)
          ? graphics.renderScale
          : normalizedDefaults.graphics
            .renderScale,

      antialias:
        typeof graphics.antialias ===
        'boolean'
          ? graphics.antialias
          : normalizedDefaults.graphics
            .antialias,

      roundPixels:
        typeof graphics.roundPixels ===
        'boolean'
          ? graphics.roundPixels
          : normalizedDefaults.graphics
            .roundPixels,

      powerPreference:
        isPowerPreference(
          graphics.powerPreference,
        )
          ? graphics.powerPreference
          : normalizedDefaults.graphics
            .powerPreference,
    },

    audio: {
      masterVolume:
        normalizeVolume(
          audio.masterVolume,
          normalizedDefaults.audio
            .masterVolume,
        ),

      musicVolume:
        normalizeVolume(
          audio.musicVolume,
          normalizedDefaults.audio
            .musicVolume,
        ),

      sfxVolume:
        normalizeVolume(
          audio.sfxVolume,
          normalizedDefaults.audio
            .sfxVolume,
        ),

      uiVolume:
        normalizeVolume(
          audio.uiVolume,
          normalizedDefaults.audio
            .uiVolume,
        ),

      muteAll:
        typeof audio.muteAll === 'boolean'
          ? audio.muteAll
          : normalizedDefaults.audio
            .muteAll,

      muteWhenUnfocused:
        typeof audio.muteWhenUnfocused ===
        'boolean'
          ? audio.muteWhenUnfocused
          : normalizedDefaults.audio
            .muteWhenUnfocused,
    },

    accessibility: {
      reducedMotion:
        typeof accessibility.reducedMotion ===
        'boolean'
          ? accessibility.reducedMotion
          : normalizedDefaults.accessibility
            .reducedMotion,

      screenShake:
        typeof accessibility.screenShake ===
        'boolean'
          ? accessibility.screenShake
          : normalizedDefaults.accessibility
            .screenShake,

      flashingEffects:
        typeof accessibility.flashingEffects ===
        'boolean'
          ? accessibility.flashingEffects
          : normalizedDefaults.accessibility
            .flashingEffects,

      highContrast:
        typeof accessibility.highContrast ===
        'boolean'
          ? accessibility.highContrast
          : normalizedDefaults.accessibility
            .highContrast,

      largeText:
        typeof accessibility.largeText ===
        'boolean'
          ? accessibility.largeText
          : normalizedDefaults.accessibility
            .largeText,

      textScale:
        isPositiveNumber(
          accessibility.textScale,
        )
          ? accessibility.textScale
          : normalizedDefaults.accessibility
            .textScale,

      colorblindMode:
        isColorblindMode(
          accessibility.colorblindMode,
        )
          ? accessibility.colorblindMode
          : normalizedDefaults.accessibility
            .colorblindMode,
    },
  };
};

export const mergeGameSettingsDefaults = (
  fallback: GameSettings,
  projectDefaults: unknown,
): GameSettings =>
  normalizeGameSettings(
    projectDefaults,
    fallback,
  );