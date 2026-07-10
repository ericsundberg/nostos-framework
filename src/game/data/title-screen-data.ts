export interface TitleScreenData {
  schemaVersion: 1;

  text: {
    title: string;
    prompt: string;
  };

  layout: {
    markerSize: number;
    markerY: number;
    titleY: number;
    promptY: number;
  };

  style: {
    titleColor: string;
    promptColor: string;
    titleFontSize: number;
    promptFontSize: number;
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

export const isTitleScreenData = (
  value: unknown,
): value is TitleScreenData => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1
  ) {
    return false;
  }

  const text = value.text;
  const layout = value.layout;
  const style = value.style;

  return (
    isRecord(text) &&
    isNonEmptyString(text.title) &&
    isNonEmptyString(text.prompt) &&

    isRecord(layout) &&
    isPositiveNumber(
      layout.markerSize,
    ) &&
    isFiniteNumber(layout.markerY) &&
    isFiniteNumber(layout.titleY) &&
    isFiniteNumber(layout.promptY) &&

    isRecord(style) &&
    isNonEmptyString(
      style.titleColor,
    ) &&
    isNonEmptyString(
      style.promptColor,
    ) &&
    isPositiveNumber(
      style.titleFontSize,
    ) &&
    isPositiveNumber(
      style.promptFontSize,
    )
  );
};