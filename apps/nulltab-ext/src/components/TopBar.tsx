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
import { PanelRight, Sparkles } from 'lucide-react';
import { Activity, ReactNode, useState } from 'react';

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
  return (
    <div
      className={`
        flex flex-wrap items-center gap-3 border-b bg-background px-4 py-3
      `}
    >
      {/* Left Section - Filter Dropdown */}
      <div>
        <Select value={filterMode} onValueChange={onFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="managed">
              <Sparkles className="text-yellow-500" />
              All
            </SelectItem>
            <SelectItem value="unmanaged">Ungrouped</SelectItem>
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
