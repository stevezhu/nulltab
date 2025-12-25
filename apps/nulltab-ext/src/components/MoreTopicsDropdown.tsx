import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { Check, X } from 'lucide-react';
import { type ReactElement } from 'react';

import { type Topic } from '#models/index.js';

import { type TopicCounts, type TopicFilterValue } from './TopicsBar.js';

export type MoreTopicsDropdownProps = {
  topics: Topic[];
  counts?: TopicCounts;
  selectedTopic: TopicFilterValue;
  onSelectTopic: (topic: TopicFilterValue) => void;
  onDeleteTopic: (id: string) => void;
  children?: ReactElement;
};

export function MoreTopicsDropdown({
  topics,
  counts,
  selectedTopic,
  onSelectTopic,
  onDeleteTopic,
  children,
}: MoreTopicsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          {topics.map((topic) => (
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
              <button
                type="button"
                className={`
                  ml-2 rounded-full p-0.5 text-muted-foreground
                  hover:bg-destructive/20 hover:text-destructive
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTopic(topic.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
