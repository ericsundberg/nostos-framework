export type JsonValidator<TValue> = (
  value: unknown,
) => value is TValue;

export interface LoadJsonAssetOptions<
  TValue,
> {
  relativePath: string;

  resolveAssetUrl: (
    relativePath: string,
  ) => string;

  validate: JsonValidator<TValue>;
}

export const loadJsonAsset = async <
  TValue,
>(
  options: LoadJsonAssetOptions<TValue>,
): Promise<TValue> => {
  const assetUrl =
    options.resolveAssetUrl(
      options.relativePath,
    );

  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to load JSON asset ` +
      `"${options.relativePath}": ` +
      `HTTP ${response.status}`,
    );
  }

  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new Error(
      `Failed to parse JSON asset ` +
      `"${options.relativePath}".`,
    );
  }

  if (!options.validate(value)) {
    throw new Error(
      `JSON asset has an invalid structure: ` +
      `"${options.relativePath}".`,
    );
  }

  return value;
};