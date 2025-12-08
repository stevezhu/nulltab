import { defineBackground } from 'wxt/utils/define-background';

import { registerTabService } from '#api/TabService.js';

export default defineBackground(() => {
  registerTabService();
});
