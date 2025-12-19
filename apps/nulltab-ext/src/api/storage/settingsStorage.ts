import { storage } from 'wxt/utils/storage';

export interface Settings {
  // Placeholder for future settings
}

const defaultSettings: Settings = {};

const settingsStorage = storage.defineItem<Settings>('local:settings', {
  fallback: defaultSettings,
});

export async function getSettings(): Promise<Settings> {
  return settingsStorage.getValue();
}

export async function updateSettings(
  updates: Partial<Settings>,
): Promise<void> {
  const current = await getSettings();
  await settingsStorage.setValue({ ...current, ...updates });
}
