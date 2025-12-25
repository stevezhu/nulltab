import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  AutocompleteInput,
} from '@workspace/shadcn/components/autocomplete';
import { Button } from '@workspace/shadcn/components/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/shadcn/components/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/shadcn/components/select';
import {
  AppWindowIcon,
  AppWindowMacIcon,
  PanelRight,
  Sparkles,
} from 'lucide-react';
import { Activity, ReactNode, useState } from 'react';

import { isMac } from '#utils/os.js';

// TODO: rename this
export type TopBarFilterMode = 'managed' | 'unmanaged';

export type TopBarProps = {
  filterMode: TopBarFilterMode;
  onFilterChange: (mode: TopBarFilterMode) => void;
  showSidePanelButton?: boolean;
  onOpenSidePanel?: () => void;
  children?: ReactNode;
};

export default function TopBar({
  filterMode,
  onFilterChange,
  showSidePanelButton = false,
  onOpenSidePanel,
  children,
}: TopBarProps) {
  const isMacQuery = useSuspenseQuery({
    queryKey: ['isMac'],
    queryFn: async () => {
      return isMac();
    },
  });
  const selectItems = [
    {
      label: (
        <>
          <Sparkles className="text-yellow-500" /> All
        </>
      ),
      value: 'managed',
    },
    {
      label: (
        <>
          {isMacQuery.data ? (
            <AppWindowMacIcon className="text-black" />
          ) : (
            <AppWindowIcon className={`text-black`} />
          )}{' '}
          Unmanaged
        </>
      ),
      value: 'unmanaged',
    },
  ];
  return (
    <div
      className={`
        flex flex-wrap items-center gap-3 border-b bg-background px-4 py-3
      `}
    >
      {/* Left Section - Filter Dropdown */}
      <div>
        <Select
          items={selectItems}
          value={filterMode}
          onValueChange={(value) => {
            if (value != null) {
              onFilterChange(value);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {children}

      {/* Right Section - Side Panel Button */}
      {showSidePanelButton && (
        <Button variant="outline" size="icon" onClick={onOpenSidePanel}>
          <PanelRight />
        </Button>
      )}
    </div>
  );
}

export function TopBarAutocomplete({
  value,
  onValueChange,
  onOpenCommandDialog,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onOpenCommandDialog: () => void;
}) {
  return (
    <div className={`flex-1 basis-[300px]`}>
      <Autocomplete value={value} onValueChange={onValueChange}>
        <AutocompleteInput
          id="tags"
          placeholder="Type a command using / or search..."
          autoFocus
          onKeyDown={(e) => {
            if (value === '' && e.key === '/') {
              e.preventDefault();
              onOpenCommandDialog();
            }
          }}
        />
        {/* <AutocompletePositioner sideOffset={6}>
          <AutocompletePopup>
            <AutocompleteEmpty>No tags found.</AutocompleteEmpty>
            <AutocompleteList>
              {(tag: Tag) => (
                <AutocompleteItem key={tag.id} value={tag.value}>
                  {tag.value}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompletePopup>
        </AutocompletePositioner> */}
      </Autocomplete>
    </div>
  );
}

export function TopBarCommand({
  searchQuery,
  onSearchChange,
  commands,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  commands?: {
    label: string;
    onSelect: () => void;
  }[];
}) {
  const [isCommandListOpen, setIsCommandListOpen] = useState(false);
  return (
    // XXX: height has here has to match the height of the command component
    <div className="relative h-[38px] flex-1 basis-[300px]">
      <Command
        className={`
          absolute h-fit max-h-[302px] rounded-lg border shadow-md
          md:min-w-[450px]
        `}
        filter={(value, search) => {
          if (!search.startsWith('/')) return 0;
          return Command.defaultFilter(value, search.substring(1));
        }}
      >
        <CommandInput
          placeholder="Type a command or search..."
          autoFocus
          value={searchQuery}
          onValueChange={(value) => {
            onSearchChange(value);
          }}
          onFocus={() => {
            setIsCommandListOpen(true);
          }}
        />
        {commands && (
          <Activity
            mode={
              isCommandListOpen && searchQuery.startsWith('/')
                ? 'visible'
                : 'hidden'
            }
          >
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {commands.map(({ label, onSelect }) => {
                return (
                  <CommandItem
                    key={label}
                    onSelect={() => {
                      onSelect();
                      onSearchChange('');
                    }}
                  >
                    <span>{label}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Activity>
        )}
      </Command>
    </div>
  );
}
