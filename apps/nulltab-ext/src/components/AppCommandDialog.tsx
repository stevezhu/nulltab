import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/shadcn/components/command';
import { ReactNode, useState } from 'react';

export function AppCommandDialog({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: {
    key: string;
    label: ReactNode;
    onSelect: () => void;
  }[];
}) {
  const [commandInputValue, setCommandInputValue] = useState('/');
  return (
    <CommandDialog
      className="max-h-full"
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setCommandInputValue('/');
        }
      }}
    >
      <Command
        filter={(value, search) => {
          if (!search.startsWith('/')) return 0;
          return Command.defaultFilter(value, search.substring(1));
        }}
      >
        <CommandInput
          placeholder="Search for a command to run..."
          activePlaceholder={
            commandInputValue === '/'
              ? 'Search or backspace to close...'
              : undefined
          }
          value={commandInputValue}
          onValueChange={(value) => {
            if (value === '') {
              onOpenChange(false);
            } else {
              setCommandInputValue(value);
            }
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Commands">
            {commands.map(({ key, label, onSelect }) => {
              return (
                <CommandItem
                  key={key}
                  onSelect={() => {
                    onOpenChange(false);
                    onSelect();
                  }}
                >
                  {label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
