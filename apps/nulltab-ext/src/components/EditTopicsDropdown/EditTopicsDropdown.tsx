import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { cn } from '@workspace/shadcn/lib/utils';
import { Palette } from 'lucide-react';
import { ComponentProps, ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useSortable } from '#hooks/useSortable.js';
import { useSortableItem } from '#hooks/useSortableItem.js';
import { type Topic } from '#models/index.js';

import { EditTopicDropdown, EditTopicDropdownItem } from './TopicItem';

// Symbol key for type-safe drag data
const topicItemKey = Symbol('topic-item');

type TopicItemData = {
  [topicItemKey]: true;
  topicId: string;
};

function getTopicItemData(topic: Topic): TopicItemData {
  return {
    [topicItemKey]: true,
    topicId: topic.id,
  };
}

function isTopicItemData(
  data: Record<string | symbol, unknown>,
): data is TopicItemData {
  return data[topicItemKey] === true;
}

// Draggable topic item for reordering
type DraggableTopicItemProps = {
  topic: Topic;
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
};

function DraggableTopicItem({
  topic,
  onUpdateTopic,
  onDeleteTopic,
}: DraggableTopicItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { state } = useSortableItem({
    item: topic,
    ref,
    getItemData: getTopicItemData,
    isItemData: isTopicItemData,
  });

  return (
    <>
      <div className="relative">
        <div
          ref={ref}
          className={cn(
            state.type === 'is-dragging' && 'opacity-50',
            state.type === 'is-dragging-over' &&
              state.closestEdge === 'top' &&
              `
                before:absolute before:inset-x-0 before:top-0 before:h-0.5
                before:bg-primary
              `,
            state.type === 'is-dragging-over' &&
              state.closestEdge === 'bottom' &&
              `
                after:absolute after:inset-x-0 after:bottom-0 after:h-0.5
                after:bg-primary
              `,
          )}
        >
          {/* <EditTopicDropdownSub
            topic={topic}
            onUpdateTopic={onUpdateTopic}
            onDeleteTopic={onDeleteTopic}
          /> */}
          <EditTopicDropdownItem topic={topic}>
            <EditTopicDropdown
              topic={topic}
              onUpdateTopic={onUpdateTopic}
              onDeleteTopic={onDeleteTopic}
            />
          </EditTopicDropdownItem>
        </div>
      </div>
      {state.type === 'preview'
        ? createPortal(<DragPreview topic={topic} />, state.container)
        : null}
    </>
  );
}

export type EditTopicsDropdownProps = {
  topics: Topic[];
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  onReorderTopics: (topicIds: string[]) => void;
  children?: ReactNode;
};

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
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          Edit Topics
          <span className="text-xs font-normal text-muted-foreground">
            (drag to reorder)
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {topics.map((topic) => (
          <DraggableTopicItem
            key={topic.id}
            topic={topic}
            onUpdateTopic={onUpdateTopic}
            onDeleteTopic={onDeleteTopic}
          />
        ))}
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

// A simplified version of our task for the user to drag around
function DragPreview({ topic }: { topic: Topic }) {
  return (
    <div className="rounded-sm border-solid bg-white p-2">{topic.name}</div>
  );
}
