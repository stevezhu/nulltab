import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  focusDashboardSearchInput(): number;
}

export const extensionMessaging = defineExtensionMessaging<ProtocolMap>();
