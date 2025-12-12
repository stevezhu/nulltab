// Draggable topic item for reordering
import { cn } from '@workspace/shadcn/lib/utils';
import { GripVertical } from 'lucide-react';
import { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useSortableItem } from '#hooks/useSortableItem.js';
import { type Topic } from '#models/index.js';

import { EditTopicDropdown } from './EditTopicDropdown';
import { getTopicItemData, isTopicItemData } from './TopicItemData';

export type SortableEditTopicsDropdownItemProps = {
  topic: Topic;
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
};

export function SortableEditTopicsDropdownItem({
  topic,
  onUpdateTopic,
  onDeleteTopic,
}: SortableEditTopicsDropdownItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { state } = useSortableItem({
    item: topic,
    ref,
    getItemData: getTopicItemData,
    isItemData: isTopicItemData,
  });

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'relative',
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
        <EditTopicsDropdownItem topic={topic}>
          <EditTopicDropdown
            topic={topic}
            onUpdateTopic={onUpdateTopic}
            onDeleteTopic={onDeleteTopic}
          />
        </EditTopicsDropdownItem>
      </div>
      {state.type === 'preview'
        ? createPortal(<DragPreview topic={topic} />, state.container)
        : null}
    </>
  );
}

function EditTopicsDropdownItem({
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

// A simplified version of our task for the user to drag around
function DragPreview({ topic }: { topic: Topic }) {
  return (
    <div className="rounded-sm border-solid bg-white p-2">{topic.name}</div>
  );
}
