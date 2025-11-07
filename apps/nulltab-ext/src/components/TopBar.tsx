import { Button } from '@workspace/shadcn/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@workspace/shadcn/components/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/shadcn/components/select';
import { PanelRight, Search } from 'lucide-react';

// TODO: rename this
export type TopBarFilterMode = 'managed' | 'unmanaged';

export type TopBarProps = {
  filterMode: TopBarFilterMode;
  onFilterChange: (mode: TopBarFilterMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSidePanelButton?: boolean;
  onOpenSidePanel?: () => void;
};

export default function TopBar({
  filterMode,
  onFilterChange,
  searchQuery,
  onSearchChange,
  showSidePanelButton = false,
  onOpenSidePanel,
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
            <SelectItem value="managed">Managed Windows</SelectItem>
            <SelectItem value="unmanaged">Unmanaged Windows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Middle Section - Search Bar */}
      <div className="flex-1 basis-[300px]">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search tabs..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
          />
        </InputGroup>
      </div>

      {/* Right Section - Side Panel Button */}
      {showSidePanelButton && (
        <Button variant="outline" size="icon" onClick={onOpenSidePanel}>
          <PanelRight />
        </Button>
      )}
    </div>
  );
}
