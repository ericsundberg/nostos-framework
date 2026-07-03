export interface Position2D {
  x: number;
  y: number;
}

export interface PlayerMovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface PlayerMovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface MovePlayerOptions {
  position: Readonly<Position2D>;
  input: Readonly<PlayerMovementInput>;
  bounds: Readonly<PlayerMovementBounds>;
  speed: number;
  deltaMilliseconds: number;
}

const clamp = (
  value: number,
  minimum: number,
  maximum: number,
): number =>
  Math.min(
    maximum,
    Math.max(minimum, value),
  );

export const movePlayer = (
  options: MovePlayerOptions,
): Position2D => {
  const horizontal =
    Number(options.input.right) -
    Number(options.input.left);

  const vertical =
    Number(options.input.down) -
    Number(options.input.up);

  const magnitude = Math.hypot(
    horizontal,
    vertical,
  );

  const deltaSeconds =
    Number.isFinite(
      options.deltaMilliseconds,
    ) &&
    options.deltaMilliseconds > 0
      ? options.deltaMilliseconds /
        1000
      : 0;

  let nextX = options.position.x;
  let nextY = options.position.y;

  if (
    magnitude > 0 &&
    Number.isFinite(options.speed) &&
    options.speed > 0
  ) {
    const distance =
      options.speed * deltaSeconds;

    nextX +=
      horizontal /
      magnitude *
      distance;

    nextY +=
      vertical /
      magnitude *
      distance;
  }

  return {
    x: clamp(
      nextX,
      options.bounds.minX,
      options.bounds.maxX,
    ),

    y: clamp(
      nextY,
      options.bounds.minY,
      options.bounds.maxY,
    ),
  };
};