import { Switch } from '@workspace/shadcn/components/switch';

import { SettingRow } from './SettingRow.js';

export function TabManagementSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`
            scroll-m-20 pb-2 text-3xl font-semibold tracking-tight
            first:mt-0
          `}
        >
          Tab Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure how tabs are organized and managed
        </p>
      </div>
      <div className="space-y-4">
        <SettingRow
          label="Auto-suspend inactive tabs"
          description="Automatically suspend tabs that haven't been used for a while"
        >
          <Switch />
        </SettingRow>
        <SettingRow
          label="Group duplicate tabs"
          description="Automatically group tabs with the same URL"
        >
          <Switch />
        </SettingRow>
        <SettingRow
          label="Show tab previews"
          description="Display thumbnail previews when hovering over tabs"
        >
          <Switch />
        </SettingRow>
      </div>
    </div>
  );
}
