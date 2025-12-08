import { Badge } from '@workspace/shadcn/components/badge';
import {
  ScrollArea,
  ScrollBar,
} from '@workspace/shadcn/components/scroll-area';
import { cn } from '@workspace/shadcn/lib/utils';
import { X } from 'lucide-react';

import { CreateTopicDialog } from '#components/CreateTopicDialog.js';
import { type Topic } from '#models/index.js';

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
};

export function TopicTabs({
  topics,
  counts,
  selectedTopic,
  onSelectTopic,
  onCreateTopic,
  onDeleteTopic,
}: TopicTabsProps) {
  return (
    <div className="border-b bg-muted/30 px-4 py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2">
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

          {/* User topics */}
          {topics.map((topic) => (
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

          {/* Add topic button */}
          <CreateTopicDialog onCreateTopic={onCreateTopic} />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
