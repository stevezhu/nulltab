import { nanoid } from 'nanoid';
import { type Static, StaticDecode, StaticEncode, Type } from 'typebox';
import { Value } from 'typebox/value';
import { storage } from 'wxt/utils/storage';

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

export type ClosedWindow = StaticDecode<typeof ClosedWindowSchema>;

// Encoded type for storage (closedAt as number instead of Date)
type EncodedClosedWindow = StaticEncode<typeof ClosedWindowSchema>;

// Define storage items using WXT storage API
const closedWindowsStorage = storage.defineItem<EncodedClosedWindow[]>(
  'local:closedWindows',
  {
    fallback: [],
  },
);

const managedWindowsStorage = storage.defineItem<number[]>(
  'local:managedWindows',
  {
    fallback: [],
  },
);

export interface WindowStorage {
  saveClosedWindow(window: Omit<ClosedWindow, 'id'>): Promise<ClosedWindow>;
  getClosedWindows(): Promise<ClosedWindow[]>;
  removeClosedWindow(id: string): Promise<void>;
  saveManagedWindow(windowId: number): Promise<void>;
  getManagedWindows(): Promise<number[]>;
  removeManagedWindow(windowId: number): Promise<void>;
}

/**
 * @deprecated Not currently used
 */
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

    const existingWindows = await closedWindowsStorage.getValue();
    const encoded = Value.Encode(ClosedWindowSchema, closedWindow);
    await closedWindowsStorage.setValue([...existingWindows, encoded]);

    return closedWindow;
  }

  async getClosedWindows(): Promise<ClosedWindow[]> {
    const data = await closedWindowsStorage.getValue();

    // Validate and decode valid closed windows
    return data
      .filter((item) => Value.Check(ClosedWindowSchema, item))
      .map((item) => Value.Decode(ClosedWindowSchema, item));
  }

  async removeClosedWindow(id: string): Promise<void> {
    const existingWindows = await closedWindowsStorage.getValue();
    const updatedWindows = existingWindows.filter((w) => w.id !== id);

    await closedWindowsStorage.setValue(updatedWindows);
  }

  async saveManagedWindow(windowId: number): Promise<void> {
    const existingManagedWindows = await managedWindowsStorage.getValue();
    if (!existingManagedWindows.includes(windowId)) {
      await managedWindowsStorage.setValue([
        ...existingManagedWindows,
        windowId,
      ]);
    }
  }

  async getManagedWindows(): Promise<number[]> {
    return managedWindowsStorage.getValue();
  }

  async removeManagedWindow(windowId: number): Promise<void> {
    const existingManagedWindows = await managedWindowsStorage.getValue();
    const updatedWindows = existingManagedWindows.filter(
      (id) => id !== windowId,
    );

    await managedWindowsStorage.setValue(updatedWindows);
  }
}

// Export a singleton instance
export const windowStorage = new LocalStorageWindowStorage();
