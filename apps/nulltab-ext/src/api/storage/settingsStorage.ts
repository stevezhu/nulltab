import { storage } from 'wxt/utils/storage';

export interface Settings {
  useNewtabOverride: boolean;
}

const defaultSettings: Settings = {
  useNewtabOverride: true,
};

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

export function watchSettings(
  callback: (settings: Settings) => void,
): () => void {
  return settingsStorage.watch(callback);
}
