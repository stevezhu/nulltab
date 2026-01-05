import { browser } from 'wxt/browser';

export async function isMac(): Promise<boolean> {
  return (await browser.runtime.getPlatformInfo()).os === 'mac';
}
