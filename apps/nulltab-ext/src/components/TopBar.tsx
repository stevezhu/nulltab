import {
  Autocomplete,
  AutocompleteInput,
} from '@workspace/shadcn/components/autocomplete';
import { Button } from '@workspace/shadcn/components/button';
import { Input } from '@workspace/shadcn/components/input';
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
import { ReactNode, Ref, useImperativeHandle, useRef } from 'react';

// TODO: rename this
export type TopBarFilterMode = 'all' | 'ungrouped';

export type TopBarProps = {
  filterMode: TopBarFilterMode;
  onFilterChange: (mode: TopBarFilterMode) => void;
  showSidePanelButton?: boolean;
  onOpenSidePanel?: () => void;
  isMac?: boolean;
  children?: ReactNode;
};

export default function TopBar({
  filterMode,
  onFilterChange,
  showSidePanelButton = false,
  onOpenSidePanel,
  isMac = false,
  children,
}: TopBarProps) {
  const selectItems: { label: ReactNode; value: TopBarFilterMode }[] = [
    {
      label: (
        <>
          <Sparkles className="text-yellow-500" /> All
        </>
      ),
      value: 'all',
    },
    {
      label: (
        <>
          {isMac ? (
            <AppWindowMacIcon className="text-black" />
          ) : (
            <AppWindowIcon className="text-black" />
          )}{' '}
          Ungrouped
        </>
      ),
      value: 'ungrouped',
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

export type TopBarAutocompleteHandle = {
  focus: () => void;
};

export function TopBarAutocomplete({
  ref,
  value,
  onValueChange,
  onOpenCommandDialog,
}: {
  ref?: Ref<TopBarAutocompleteHandle>;
  value: string;
  onValueChange: (value: string) => void;
  onOpenCommandDialog: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        inputRef.current?.focus();
      },
    };
  }, []);
  return (
    <div className={`flex-1 basis-[300px]`}>
      <Autocomplete value={value} onValueChange={onValueChange}>
        <AutocompleteInput
          render={<Input ref={inputRef} />}
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
