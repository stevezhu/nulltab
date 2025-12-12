import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { cn } from '@workspace/shadcn/lib/utils';
import {
  Check,
  GripVertical,
  MoreHorizontal,
  Palette,
  Trash2,
  X,
} from 'lucide-react';
import { ReactNode } from 'react';

import { Topic } from '#models/index.js';

export function EditTopicDropdownItem({
  topic,
  children,
}: {
  topic: Topic;
  children?: ReactNode;
}) {
  return (
    <div
      className={`
        flex items-center gap-2
        hover:cursor-grab
      `}
    >
      <div className="inline-block">
        <GripVertical className="size-4" />
      </div>
      <span
        className="size-3 rounded-full"
        style={{ backgroundColor: topic.color || '#888' }}
      />
      <span className="flex-1 truncate">{topic.name}</span>
      {children}
    </div>
  );
}

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

export function EditTopicDropdown({
  topic,
  onUpdateTopic,
  onDeleteTopic,
  open,
}: {
  topic: Topic;
  open?: boolean;
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
}) {
  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette />
          Change Color
        </DropdownMenuLabel>
        <div className="grid grid-cols-4 gap-1 p-2">
          {TOPIC_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                `
                  relative h-6 w-6 rounded-full transition-transform
                  hover:scale-110
                `,
                `
                  focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
                  focus:outline-none
                `,
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
                <Check
                  className={`
                    absolute inset-0 m-auto h-3.5 w-3.5 text-white
                    drop-shadow-sm
                  `}
                />
              )}
            </button>
          ))}
        </div>
        <DropdownMenuItem
          onClick={() => {
            onUpdateTopic({ ...topic, color: undefined });
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Remove color
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            onDeleteTopic(topic.id);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete topic
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
