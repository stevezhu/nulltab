import { useMutation } from '@tanstack/react-query';
import { createProxyService } from '@webext-core/proxy-service';
import { CommandShortcut } from '@workspace/shadcn/components/command';
import { Dispatch, SetStateAction, useState } from 'react';
import { browser } from 'wxt/browser';

import { TABS_SERVICE_KEY } from '#api/proxyService/proxyServiceKeys.js';
import { AppCommandDialogProps } from '#components/AppCommandDialog.js';
import { queryClient } from '#router.js';
import { openDashboard, openSidePanel } from '#utils/management.js';

const tabsService = createProxyService(TABS_SERVICE_KEY);

export type UseAppCommandDialogReturn = {
  isCommandDialogOpen: boolean;
  setIsCommandDialogOpen: Dispatch<SetStateAction<boolean>>;
  commandDialogProps: AppCommandDialogProps;
};

export function useAppCommandDialog(): UseAppCommandDialogReturn {
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);

  const suspendStaleTabs = useMutation({
    mutationFn: () => tabsService.suspendStaleTabs(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  const suspendGroupedTabs = useMutation({
    mutationFn: () => tabsService.suspendGroupedTabs(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  const undoCloseTab = useMutation({
    mutationFn: async () => {
      await browser.sessions.restore();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tabs'] });
    },
  });

  return {
    isCommandDialogOpen,
    setIsCommandDialogOpen,
    commandDialogProps: {
      open: isCommandDialogOpen,
      onOpenChange: setIsCommandDialogOpen,
      commands: [
        {
          key: 'undo-close-tab',
          label: (
            <>
              <span>Undo Close Tab</span>
              {/* TODO: make sure this is the right shortcut */}
              <CommandShortcut>⌘+⇧+T</CommandShortcut>
            </>
          ),
          onSelect: undoCloseTab.mutate,
        },
        {
          key: 'suspend-stale-tabs',
          label: 'Suspend Stale Tabs',
          onSelect: suspendStaleTabs.mutate,
        },
        {
          key: 'suspend-all-grouped-tabs',
          label: 'Suspend All Grouped Tabs',
          onSelect: suspendGroupedTabs.mutate,
        },
        {
          key: 'open-side-panel',
          label: 'Open Side Panel',
          onSelect: () => void openSidePanel(),
        },
        {
          key: 'open-dashboard',
          label: (
            <>
              <span>Open Dashboard</span>
              {/* TODO: replace with shortcut from browser.commands.getAll() */}
              <CommandShortcut>⌥+T</CommandShortcut>
            </>
          ),
          onSelect: () => void openDashboard(),
        },
        // TODO: add more commands here
      ],
    },
  };
}
