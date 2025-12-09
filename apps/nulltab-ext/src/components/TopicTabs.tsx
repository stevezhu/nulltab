import { Badge } from '@workspace/shadcn/components/badge';
import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { cn } from '@workspace/shadcn/lib/utils';
import { Check, ChevronDown, Palette, X } from 'lucide-react';
import { useMemo } from 'react';

import { CreateTopicDialog } from '#components/CreateTopicDialog.js';
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

/** Maximum number of topic pills to show before collapsing into dropdown */
const MAX_VISIBLE_TOPICS = 5;

// XXX: this is a workaround to avoid the type being inferred as a union of string literals
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type TopicFilterValue = 'all' | 'uncategorized' | string;

export type TopicCounts = {
  all: number;
  uncategorized: number;
  byTopic: Record<string, number>;
};

export type TopicTabsProps = {
  topics: Topic[];
  counts?: TopicCounts;
  selectedTopic: TopicFilterValue;
  onSelectTopic: (topic: TopicFilterValue) => void;
  onCreateTopic: (name: string, color?: string) => void;
  onDeleteTopic: (id: string) => void;
  onUpdateTopic: (topic: Topic) => void;
};

export function TopicTabs({
  topics,
  counts,
  selectedTopic,
  onSelectTopic,
  onCreateTopic,
  onDeleteTopic,
  onUpdateTopic,
}: TopicTabsProps) {
  const { visibleTopics, overflowTopics, selectedOverflowTopic } =
    useMemo(() => {
      const visible = topics.slice(0, MAX_VISIBLE_TOPICS);
      const overflow = topics.slice(MAX_VISIBLE_TOPICS);

      // Check if the selected topic is in the overflow
      const selectedInOverflow = overflow.find((t) => t.id === selectedTopic);

      return {
        visibleTopics: visible,
        overflowTopics: overflow,
        selectedOverflowTopic: selectedInOverflow,
      };
    }, [topics, selectedTopic]);

  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* All tabs */}
        <TopicPill
          label="All"
          count={counts?.all}
          selected={selectedTopic === 'all'}
          onClick={() => {
            onSelectTopic('all');
          }}
        />

        {/* Uncategorized */}
        <TopicPill
          label="Uncategorized"
          count={counts?.uncategorized}
          selected={selectedTopic === 'uncategorized'}
          onClick={() => {
            onSelectTopic('uncategorized');
          }}
        />

        {/* Visible user topics */}
        {visibleTopics.map((topic) => (
          <TopicPill
            key={topic.id}
            label={topic.name}
            count={counts?.byTopic[topic.id]}
            color={topic.color}
            selected={selectedTopic === topic.id}
            onClick={() => {
              onSelectTopic(topic.id);
            }}
            onDelete={() => {
              onDeleteTopic(topic.id);
            }}
          />
        ))}

        {/* Overflow dropdown - shows when there are more topics than MAX_VISIBLE_TOPICS */}
        {overflowTopics.length > 0 && (
          <OverflowTopicsDropdown
            topics={topics}
            overflowTopics={overflowTopics}
            counts={counts}
            selectedTopic={selectedTopic}
            selectedOverflowTopic={selectedOverflowTopic}
            onSelectTopic={onSelectTopic}
            onDeleteTopic={onDeleteTopic}
            onUpdateTopic={onUpdateTopic}
          />
        )}

        {/* Add topic button */}
        <CreateTopicDialog onCreateTopic={onCreateTopic} />

        {/* Edit topics dropdown - only show if no overflow (otherwise edit is in overflow menu) */}
        {topics.length > 0 && overflowTopics.length === 0 && (
          <EditTopicsDropdown topics={topics} onUpdateTopic={onUpdateTopic} />
        )}
      </div>
    </div>
  );
}

type TopicPillProps = {
  label: string;
  count?: number;
  color?: string;
  selected?: boolean;
  onClick: () => void;
  onDelete?: () => void;
};

function TopicPill({
  label,
  count,
  color,
  selected,
  onClick,
  onDelete,
}: TopicPillProps) {
  return (
    <Badge
      variant={selected ? 'default' : 'outline'}
      className={cn(
        'cursor-pointer gap-1.5 px-3 py-1 text-xs transition-colors select-none',
        selected && 'bg-primary text-primary-foreground',
        !selected && 'hover:bg-accent',
      )}
      style={
        color && selected
          ? { backgroundColor: color, borderColor: color }
          : color && !selected
            ? { borderColor: color, color: color }
            : undefined
      }
      onClick={onClick}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: selected ? 'currentColor' : color }}
        />
      )}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'ml-0.5 tabular-nums',
            selected ? 'opacity-80' : 'text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
      {onDelete && selected && (
        <button
          type="button"
          className={`
            ml-1 rounded-full p-0.5
            hover:bg-white/20
          `}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}

type OverflowTopicsDropdownProps = {
  topics: Topic[];
  overflowTopics: Topic[];
  counts?: TopicCounts;
  selectedTopic: TopicFilterValue;
  selectedOverflowTopic?: Topic;
  onSelectTopic: (topic: TopicFilterValue) => void;
  onDeleteTopic: (id: string) => void;
  onUpdateTopic: (topic: Topic) => void;
};

function OverflowTopicsDropdown({
  topics,
  overflowTopics,
  counts,
  selectedTopic,
  selectedOverflowTopic,
  onSelectTopic,
  onDeleteTopic,
  onUpdateTopic,
}: OverflowTopicsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={selectedOverflowTopic ? 'default' : 'outline'}
          className={cn(
            `
              cursor-pointer gap-1 px-3 py-1 text-xs transition-colors
              select-none
            `,
            selectedOverflowTopic && 'bg-primary text-primary-foreground',
            !selectedOverflowTopic && 'hover:bg-accent',
          )}
          style={
            selectedOverflowTopic?.color
              ? {
                  backgroundColor: selectedOverflowTopic.color,
                  borderColor: selectedOverflowTopic.color,
                }
              : undefined
          }
        >
          {selectedOverflowTopic ? (
            <>
              {selectedOverflowTopic.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'currentColor' }}
                />
              )}
              {selectedOverflowTopic.name}
              {counts?.byTopic[selectedOverflowTopic.id] !== undefined && (
                <span className="ml-0.5 tabular-nums opacity-80">
                  {counts.byTopic[selectedOverflowTopic.id]}
                </span>
              )}
              <button
                type="button"
                className={`
                  ml-1 rounded-full p-0.5
                  hover:bg-white/20
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTopic(selectedOverflowTopic.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>+{overflowTopics.length} more</>
          )}
          <ChevronDown className="h-3 w-3" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Overflow topics for selection */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>More Topics</DropdownMenuLabel>
          {overflowTopics.map((topic) => (
            <DropdownMenuItem
              key={topic.id}
              onClick={() => {
                onSelectTopic(topic.id);
              }}
            >
              <span
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: topic.color || '#888' }}
              />
              <span className="flex-1 truncate">{topic.name}</span>
              {counts?.byTopic[topic.id] !== undefined && (
                <span className="ml-2 text-muted-foreground tabular-nums">
                  {counts.byTopic[topic.id]}
                </span>
              )}
              {selectedTopic === topic.id && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Edit all topics */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Edit Topics</DropdownMenuLabel>
          {topics.map((topic) => (
            <DropdownMenuSub key={topic.id}>
              <DropdownMenuSubTrigger>
                <span
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: topic.color || '#888' }}
                />
                <span className="flex-1 truncate">{topic.name}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5" />
                  Change Color
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
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
                          focus:ring-2 focus:ring-offset-2
                          focus:ring-offset-background focus:outline-none
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    onUpdateTopic({ ...topic, color: undefined });
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove color
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type EditTopicsDropdownProps = {
  topics: Topic[];
  onUpdateTopic: (topic: Topic) => void;
};

function EditTopicsDropdown({
  topics,
  onUpdateTopic,
}: EditTopicsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`
            h-7 w-7 p-0 text-muted-foreground
            hover:text-foreground
          `}
        >
          <Palette className="h-4 w-4" />
          <span className="sr-only">Edit topics</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Edit Topics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {topics.map((topic) => (
          <DropdownMenuSub key={topic.id}>
            <DropdownMenuSubTrigger>
              <span
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: topic.color || '#888' }}
              />
              <span className="flex-1 truncate">{topic.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5" />
                Change Color
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                        focus:ring-2 focus:ring-offset-2
                        focus:ring-offset-background focus:outline-none
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onUpdateTopic({ ...topic, color: undefined });
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove color
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
