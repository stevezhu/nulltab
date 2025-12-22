import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
  flashTab(): number;
}

export const extensionMessaging = defineExtensionMessaging<ProtocolMap>();
