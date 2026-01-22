import { useSuspenseQuery } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useRef, useState } from 'react';

import { extensionMessaging } from '#api/extensionMessaging.js';
import { isMacQueryOptions } from '#api/queryOptions/isMac.js';
import { AppCommandDialog } from '#components/AppCommandDialog.js';
import TopBar, {
  TopBarAutocomplete,
  TopBarAutocompleteHandle,
  type TopBarFilterMode,
} from '#components/TopBar.js';
import { TopicFilterValue, TopicsBar } from '#components/TopicsBar.js';
import { useAppCommandDialog } from '#hooks/useAppCommandDialog.js';
import { useTabsListeners } from '#hooks/useTabsListeners.js';
import { useWindowsListeners } from '#hooks/useWindowsListeners.js';
import { openSidePanel } from '#utils/management.js';

import { AllTabs, UngroupedTabWindowList } from './AppContent';
import { useTopicsBar } from './useTopicsBar';

export function ExtensionPage({ isPopup }: { isPopup?: boolean }) {
  useTabsListeners();
  useWindowsListeners();

  const [filterMode, setFilterMode] = useState<TopBarFilterMode>(
    'all' satisfies TopBarFilterMode,
  );
  const [searchValue, setSearchValue] = useState<string>('');
  // TODO: use tanstack pacer for this?
  const deferredSearchValue = useDeferredValue(searchValue);
  // const deferredSearchValue = searchValue;
  const [selectedTopic, setSelectedTopic] = useState<TopicFilterValue>(
    'all' satisfies TopicFilterValue,
  );

  const { setIsCommandDialogOpen, commandDialogProps } = useAppCommandDialog();
  const isMacQuery = useSuspenseQuery(isMacQueryOptions);

  // NOTE: crucial to focus the autocomplete input when the dashboard tab is focused for ux
  const autocompleteRef = useRef<TopBarAutocompleteHandle>(null);
  useEffect(() => {
    return extensionMessaging.onMessage('focusDashboardSearchInput', () => {
      autocompleteRef.current?.focus();
    });
  }, []);

  const topicsBarProps = useTopicsBar({
    selectedTopic,
    setSelectedTopic,
  });

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Reverse the markup order and use flex order to overlap correctly.
      The final element will be on top. */}

        {/* Content Area */}
        {filterMode === 'ungrouped' ? (
          <UngroupedTabWindowList
            className="order-3 flex-1"
            searchValue={deferredSearchValue}
          />
        ) : (
          <AllTabs
            className="order-3 flex-1"
            searchValue={deferredSearchValue}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        )}

        {/* Topic Tabs - only show in all view */}
        {filterMode === 'all' && (
          <div className="order-2">
            <TopicsBar {...topicsBarProps} />
          </div>
        )}

        {/* Top Bar */}
        <div className="order-1">
          <TopBar
            filterMode={filterMode}
            onFilterChange={setFilterMode}
            showSidePanelButton={isPopup}
            onOpenSidePanel={openSidePanel}
            isMac={isMacQuery.data}
          >
            <TopBarAutocomplete
              ref={autocompleteRef}
              value={searchValue}
              onValueChange={(value) => {
                setSearchValue(value);
              }}
              onOpenCommandDialog={() => {
                setIsCommandDialogOpen(true);
              }}
            />
          </TopBar>
        </div>
      </div>

      <AppCommandDialog {...commandDialogProps} />
    </>
  );
}
