import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

import { registerTabService } from '#api/TabService.js';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  registerTabService();
});
