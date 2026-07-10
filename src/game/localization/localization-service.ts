import type { LocalizationData } from './localization-data';

type FormatValues =
  Record<string, string | number | boolean>;

export class LocalizationService {
  private readonly missingKeys =
    new Set<string>();

  public constructor(
    private readonly data:
      LocalizationData,
  ) {}

  public text(
    key: string,
    fallback?: string,
  ): string {
    const value =
      this.data.strings[key];

    if (value !== undefined) {
      return value;
    }

    this.warnMissingKey(key);

    return fallback ?? `[${key}]`;
  }

  public format(
    key: string,
    values: FormatValues,
    fallback?: string,
  ): string {
    const template =
      this.text(key, fallback);

    return template.replace(
      /\{([a-zA-Z0-9_]+)\}/gu,
      (match, name: string) => {
        const value = values[name];

        return value === undefined
          ? match
          : String(value);
      },
    );
  }

  public description(
    key: string,
    fallback = '',
  ): string {
    const value =
      this.data.descriptions?.[key];

    if (value !== undefined) {
      return value;
    }

    return fallback;
  }

  public getLocale(): string {
    return this.data.locale;
  }

  private warnMissingKey(
    key: string,
  ): void {
    if (this.missingKeys.has(key)) {
      return;
    }

    this.missingKeys.add(key);

    console.warn(
      `Missing localization key: ${key}`,
    );
  }
}