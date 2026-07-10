import { loadJsonAsset } from '../../core/data/load-json-asset';
import {
  isLocalizationData,
  type LocalizationData,
} from './localization-data';

export interface LoadLocalizationOptions {
  resolveAssetUrl: (
    relativePath: string,
  ) => string;
  locale?: string;
}

const DEFAULT_LOCALE = 'en';

export const loadLocalization =
  async (
    options: LoadLocalizationOptions,
  ): Promise<LocalizationData> => {
    const locale =
      options.locale ?? DEFAULT_LOCALE;

    return loadJsonAsset<LocalizationData>({
      relativePath:
        `localization/localization-${locale}.json`,

      resolveAssetUrl:
        options.resolveAssetUrl,

      validate:
        isLocalizationData,
    });
  };