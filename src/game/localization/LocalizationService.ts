import type { LocalizationData } from './LocalizationData';

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