export interface GameplayData {
  schemaVersion: 1;

  playfield: {
    width: number;
    height: number;
    padding: number;
    backgroundColor: string;
    borderColor: string;
  };

  player: {
    size: number;
    speed: number;
    color: string;
  };

  text: {
    instructions: string;
  };
}

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

export const isGameplayData = (
  value: unknown,
): value is GameplayData => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1
  ) {
    return false;
  }

  const playfield = value.playfield;
  const player = value.player;
  const text = value.text;

  if (
    !isRecord(playfield) ||
    !isRecord(player) ||
    !isRecord(text)
  ) {
    return false;
  }

  const width = playfield.width;
  const height = playfield.height;
  const padding = playfield.padding;
  const backgroundColor =
    playfield.backgroundColor;
  const borderColor =
    playfield.borderColor;

  const playerSize = player.size;
  const playerSpeed = player.speed;
  const playerColor = player.color;

  if (
    !isPositiveNumber(width) ||
    !isPositiveNumber(height) ||
    !isNonNegativeNumber(padding) ||
    !isNonEmptyString(
      backgroundColor,
    ) ||
    !isNonEmptyString(borderColor) ||
    !isPositiveNumber(playerSize) ||
    !isPositiveNumber(playerSpeed) ||
    !isNonEmptyString(playerColor) ||
    !isNonEmptyString(
      text.instructions,
    )
  ) {
    return false;
  }

  const usableWidth =
    width - padding * 2;

  const usableHeight =
    height - padding * 2;

  return (
    usableWidth > playerSize &&
    usableHeight > playerSize
  );
};