export interface LocalizationData {
  schemaVersion: 1;
  locale: string;
  strings: Record<string, string>;
  descriptions?: Record<string, string>;
}

const localizationKeyPattern =
  /^[a-z][a-z0-9_]*$/u;

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

const isLocalizationKey = (
  value: string,
): boolean =>
  localizationKeyPattern.test(value);

const isStringMap = (
  value: unknown,
): value is Record<string, string> => {
  if (!isRecord(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, entryValue]) =>
      isLocalizationKey(key) &&
      isNonEmptyString(entryValue),
  );
};

export const isLocalizationData = (
  value: unknown,
): value is LocalizationData => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !isNonEmptyString(value.locale) ||
    !isStringMap(value.strings)
  ) {
    return false;
  }

  if (value.descriptions === undefined) {
    return true;
  }

  if (!isStringMap(value.descriptions)) {
    return false;
  }

  const stringKeys =
    new Set(Object.keys(value.strings));

  return Object.keys(
    value.descriptions,
  ).every((key) => stringKeys.has(key));
};