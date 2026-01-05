import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { Palette } from 'lucide-react';
import { ComponentProps, ReactElement } from 'react';

import { useSortable } from '#hooks/useSortable.js';
import { type Topic } from '#models/index.js';

import { SortableEditTopicsDropdownItem } from './EditTopicsDropdownItem';
import { isTopicItemData } from './TopicItemData';

export type EditTopicsDropdownProps = {
  topics: Topic[];
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onReorderTopics: (topicIds: string[]) => void;
  children?: ReactElement;
};

/**
 * Dropdown menu for editing all topics.
 * @param props
 * @returns
 */
export function EditTopicsDropdown({
  topics,
  onUpdateTopic,
  onDeleteTopic,
  onReorderTopics,
  children,
}: EditTopicsDropdownProps) {
  useSortable({
    items: topics,
    setItems: (topics) => {
      onReorderTopics(topics.map((topic) => topic.id));
    },
    isSortableData: isTopicItemData,
    isMatch: (topic, data) => topic.id === data.topicId,
    getElement: (data) =>
      document.querySelector(`[data-topic-id="${data.topicId}"]`),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={children} />
      <DropdownMenuContent align="end" className="w-56 text-sm">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Edit Topics{' '}
            <span className="font-normal text-muted-foreground">
              (drag to reorder)
            </span>
          </DropdownMenuLabel>
          {topics.map((topic) => (
            <SortableEditTopicsDropdownItem
              key={topic.id}
              topic={topic}
              onUpdateTopic={onUpdateTopic}
              onDeleteTopic={onDeleteTopic}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EditTopicsButton(props: ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <Palette />
      <span className="sr-only">Edit topics</span>
    </Button>
  );
}
