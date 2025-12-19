import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Switch } from '@workspace/shadcn/components/switch';

import {
  settingsKeys,
  settingsQueryOptions,
} from '#api/queryOptions/settings.js';
import { updateSettings } from '#api/storage/settingsStorage.js';

import { SettingRow } from './SettingRow.js';

export function AppearanceSection() {
  const queryClient = useQueryClient();
  const { data: settings } = useSuspenseQuery(settingsQueryOptions);

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.root });
    },
  });

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
          label="Use as new tab page"
          description="Replace the browser's new tab page with NullTab"
        >
          <Switch
            checked={settings.useNewtabOverride}
            onCheckedChange={(checked) => {
              updateSettingsMutation.mutate({ useNewtabOverride: checked });
            }}
          />
        </SettingRow>
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
