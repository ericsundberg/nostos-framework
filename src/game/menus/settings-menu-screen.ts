import type { GameSettings } from '../settings/game-settings';
import { MenuButton } from './menu-button';

export type SettingsScreen =
  | 'categories'
  | 'gameplay'
  | 'graphics'
  | 'audio'
  | 'placeholder';

export type GameplayBooleanSetting =
  keyof Pick<
    GameSettings['gameplay'],
    | 'showLaunchScreen'
    | 'showPipelineMarker'
  >;

export type GraphicsNumberSetting =
  keyof Pick<
    GameSettings['graphics'],
    | 'fpsLimit'
    | 'backgroundFpsLimit'
  >;

export type AudioNumberSetting =
  keyof Pick<
    GameSettings['audio'],
    | 'masterVolume'
    | 'musicVolume'
    | 'sfxVolume'
    | 'uiVolume'
  >;

export type AudioBooleanSetting =
  keyof Pick<
    GameSettings['audio'],
    | 'muteAll'
    | 'muteWhenUnfocused'
  >;

export interface SettingsMenuEntry {
  id: string;
  label: string;
  enabled?: boolean;
  onActivate: () => void;
}

export const createSettingsMenuButton = (
  entry: SettingsMenuEntry,
): MenuButton =>
  new MenuButton({
    id: entry.id,
    label: entry.label,
    enabled: entry.enabled,
    onActivate: entry.onActivate,
  });