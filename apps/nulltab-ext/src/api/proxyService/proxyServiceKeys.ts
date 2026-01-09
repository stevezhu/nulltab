import type { ProxyServiceKey } from '@webext-core/proxy-service';

import type { TabsService } from './TabsService';
//     ^^^^ IMPORTANT: do not import the math service's value, just it's type.

export const TABS_SERVICE_KEY = 'tabs-service' as ProxyServiceKey<TabsService>;
