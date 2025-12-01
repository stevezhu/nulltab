import { type StaticParse, Type } from 'typebox';
import { type Browser } from 'wxt/browser';

/**
 * Basic subset of window data that can be used to render a window.
 */
export type WindowData = {
  /**
   * Define manually to make this required.
   */
  id: number;
};

/**
 * Basic subset of tab data that can be used to render a tab.
 */
export type TabData = Pick<
  Browser.tabs.Tab,
  'windowId' | 'title' | 'url' | 'favIconUrl' | 'active' | 'lastAccessed' | 'discarded'
> & {
  /**
   * Define manually to make this required.
   */
  id: number;
};

const Timestamp = Type.Codec(Type.Number())
  .Decode((value) => new Date(value))
  .Encode((value) => value.getTime());

export const SerializedTabSchema = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),
  favIconUrl: Type.Optional(Type.String()),
  windowId: Type.String(),
});

export type SerializedTab = StaticParse<typeof SerializedTabSchema>;

// TODO: use this for closed windows
export const SerializedWindowSchema = Type.Object({
  id: Type.String(),
  closedAt: Timestamp,
  tabs: Type.Array(SerializedTabSchema),
});

export type SerializedWindow = StaticParse<typeof SerializedWindowSchema>;
