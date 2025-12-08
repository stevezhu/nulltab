import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { cn } from '@workspace/shadcn/lib/utils';
import { Check, ChevronDown, Palette, Pencil, Trash2 } from 'lucide-react';

import { type Topic } from '#models/index.js';

const TOPIC_COLORS: string[] = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export type AllTopicsDropdownProps = {
  topics: Topic[];
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
};

export function AllTopicsDropdown({
  topics,
  onUpdateTopic,
  onDeleteTopic,
}: AllTopicsDropdownProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`
            h-7 gap-1 px-2 text-muted-foreground
            hover:text-foreground
          `}
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="text-xs">Edit</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Edit Topics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {topics.map((topic) => (
          <DropdownMenuSub key={topic.id}>
            <DropdownMenuSubTrigger className="gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: topic.color ?? '#6b7280' }}
              />
              <span className="truncate">{topic.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5" />
                  Change Color
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-4 gap-1.5 p-2">
                  {TOPIC_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        `
                          flex h-6 w-6 items-center justify-center rounded-full
                          transition-all
                        `,
                        topic.color === color
                          ? 'ring-2 ring-offset-2 ring-offset-background'
                          : 'hover:scale-110',
                      )}
                      style={{
                        backgroundColor: color,
                        // @ts-expect-error - CSS custom property for Tailwind ring color
                        '--tw-ring-color': color,
                      }}
                      onClick={() => {
                        onUpdateTopic({ ...topic, color });
                      }}
                    >
                      {topic.color === color && (
                        <Check className="h-3 w-3 text-white drop-shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    onDeleteTopic(topic.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Topic
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
