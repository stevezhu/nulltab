import { Switch } from '@workspace/shadcn/components/switch';

import { SettingRow } from './SettingRow.js';

export function AppearanceSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`
            scroll-m-20 pb-2 text-3xl font-semibold tracking-tight
            first:mt-0
          `}
        >
          Appearance
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize how NullTab looks and feels
        </p>
      </div>
      <div className="space-y-4">
        <SettingRow
          label="Dark mode"
          description="Use dark theme for the interface"
        >
          <Switch />
        </SettingRow>
        <SettingRow
          label="Compact view"
          description="Show more tabs with less spacing"
        >
          <Switch />
        </SettingRow>
      </div>
    </div>
  );
}
