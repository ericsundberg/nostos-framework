export interface GameSettings {
  showPipelineMarker: boolean;
}

export const DEFAULT_GAME_SETTINGS:
  GameSettings = {
    showPipelineMarker: true,
  };

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

export const normalizeGameSettings = (
  value: unknown,
): GameSettings => {
  if (!isRecord(value)) {
    return {
      ...DEFAULT_GAME_SETTINGS,
    };
  }

  return {
    showPipelineMarker:
      typeof value.showPipelineMarker ===
      'boolean'
        ? value.showPipelineMarker
        : DEFAULT_GAME_SETTINGS
          .showPipelineMarker,
  };
};