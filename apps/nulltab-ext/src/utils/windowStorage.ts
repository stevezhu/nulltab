import { nanoid } from 'nanoid';
import { type Static, StaticParse, Type } from 'typebox';
import { Value } from 'typebox/value';
import { browser } from 'wxt/browser';

const Timestamp = Type.Codec(Type.Number())
  .Decode((value) => new Date(value))
  .Encode((value) => value.getTime());

export const ClosedTabSchema = Type.Object({
  title: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),
  favIconUrl: Type.Optional(Type.String()),
});

export type ClosedTab = Static<typeof ClosedTabSchema>;

export const ClosedWindowSchema = Type.Object({
  id: Type.String(),
  originalWindowId: Type.Optional(Type.Number()),
  tabs: Type.Array(ClosedTabSchema),
  closedAt: Timestamp,
});

export type ClosedWindow = StaticParse<typeof ClosedWindowSchema>;

export interface WindowStorage {
  saveClosedWindow(window: Omit<ClosedWindow, 'id'>): Promise<ClosedWindow>;
  getClosedWindows(): Promise<ClosedWindow[]>;
  removeClosedWindow(id: string): Promise<void>;
  saveManagedWindow(windowId: number): Promise<void>;
  getManagedWindows(): Promise<number[]>;
  removeManagedWindow(windowId: number): Promise<void>;
}

const STORAGE_KEY = 'closedWindows';
const MANAGED_WINDOWS_KEY = 'managedWindows';

export class LocalStorageWindowStorage implements WindowStorage {
  async saveClosedWindow(
    window: Omit<ClosedWindow, 'id'>,
  ): Promise<ClosedWindow> {
    const closedWindow: ClosedWindow = {
      originalWindowId: window.originalWindowId,
      tabs: window.tabs,
      closedAt: window.closedAt,
      id: nanoid(),
    };
    console.log('closedWindow', closedWindow);

    const existingWindows = await this.getClosedWindows();
    const updatedWindows = [...existingWindows, closedWindow];

    await browser.storage.local.set({
      [STORAGE_KEY]: updatedWindows.map((w) =>
        Value.Encode(ClosedWindowSchema, w),
      ),
    });

    const result = await browser.storage.local.get(STORAGE_KEY);
    console.log('result', result);

    return closedWindow;
  }

  async getClosedWindows(): Promise<ClosedWindow[]> {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const data: unknown = result[STORAGE_KEY] ?? [];

    // Validate and filter valid closed windows
    const validWindows = Array.isArray(data)
      ? data.filter((item): item is ClosedWindow =>
          Value.Check(ClosedWindowSchema, item),
        )
      : [];

    return validWindows;
  }

  async removeClosedWindow(id: string): Promise<void> {
    const existingWindows = await this.getClosedWindows();
    const updatedWindows = existingWindows.filter((w) => w.id !== id);

    await browser.storage.local.set({ [STORAGE_KEY]: updatedWindows });
  }

  async saveManagedWindow(windowId: number): Promise<void> {
    const existingManagedWindows = await this.getManagedWindows();
    if (!existingManagedWindows.includes(windowId)) {
      const updatedWindows = [...existingManagedWindows, windowId];
      await browser.storage.local.set({
        [MANAGED_WINDOWS_KEY]: updatedWindows,
      });
    }
  }

  async getManagedWindows(): Promise<number[]> {
    const result = await browser.storage.local.get(MANAGED_WINDOWS_KEY);
    const data: unknown = result[MANAGED_WINDOWS_KEY] ?? [];

    // Validate and filter valid window IDs
    const validWindowIds = Array.isArray(data)
      ? data.filter((item): item is number => typeof item === 'number')
      : [];

    return validWindowIds;
  }

  async removeManagedWindow(windowId: number): Promise<void> {
    const existingManagedWindows = await this.getManagedWindows();
    const updatedWindows = existingManagedWindows.filter(
      (id) => id !== windowId,
    );

    await browser.storage.local.set({ [MANAGED_WINDOWS_KEY]: updatedWindows });
  }
}

// Export a singleton instance
export const windowStorage = new LocalStorageWindowStorage();
