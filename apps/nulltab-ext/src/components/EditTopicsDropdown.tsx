import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { Button } from '@workspace/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@workspace/shadcn/components/dropdown-menu';
import { cn } from '@workspace/shadcn/lib/utils';
import { Check, GripVertical, Palette, Trash2, X } from 'lucide-react';
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

// Symbol key for type-safe drag data
const topicItemKey = Symbol('topic-item');

type TopicItemData = {
  [topicItemKey]: true;
  topicId: string;
  index: number;
  instanceId: symbol;
};

function getTopicItemData({
  topicId,
  index,
  instanceId,
}: {
  topicId: string;
  index: number;
  instanceId: symbol;
}): TopicItemData {
  return {
    [topicItemKey]: true,
    topicId,
    index,
    instanceId,
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
  index: number;
  instanceId: symbol;
  onUpdateTopic: (topic: Topic) => void;
  onDeleteTopic: (id: string) => void;
  isDraggingAny: boolean;
};

function DraggableTopicItem({
  topic,
  index,
  instanceId,
  onUpdateTopic,
  onDeleteTopic,
  isDraggingAny,
}: DraggableTopicItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const element = ref.current;
    const handle = handleRef.current;
    if (!element || !handle) return;

    const data = getTopicItemData({ topicId: topic.id, index, instanceId });

    return combine(
      draggable({
        element,
        dragHandle: handle,
        getInitialData: () => data,
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop: () => {
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          // Only allow drops from the same instance
          return (
            isTopicItemData(source.data) &&
            source.data.instanceId === instanceId
          );
        },
        getData: ({ input }) => {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        onDrag: ({ source, self }) => {
          const isSource = source.element === element;
          if (isSource) {
            setClosestEdge(null);
            return;
          }

          const closestEdge = extractClosestEdge(self.data);
          const sourceIndex = source.data['index'];

          if (typeof sourceIndex !== 'number') {
            setClosestEdge(closestEdge);
            return;
          }

          // Hide drop indicator when it would be redundant
          const isItemBeforeSource = index === sourceIndex - 1;
          const isItemAfterSource = index === sourceIndex + 1;
          const isDropIndicatorHidden =
            (isItemBeforeSource && closestEdge === 'bottom') ||
            (isItemAfterSource && closestEdge === 'top');

          if (isDropIndicatorHidden) {
            setClosestEdge(null);
            return;
          }

          setClosestEdge(closestEdge);
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: () => {
          setClosestEdge(null);
        },
      }),
    );
  }, [topic.id, index, instanceId]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-sm',
        isDragging && 'opacity-50',
        closestEdge === 'top' &&
          `
            before:absolute before:inset-x-0 before:top-0 before:h-0.5
            before:bg-primary
          `,
        closestEdge === 'bottom' &&
          `
            after:absolute after:inset-x-0 after:bottom-0 after:h-0.5
            after:bg-primary
          `,
      )}
    >
      <DropdownMenuSub open={isDraggingAny ? false : undefined}>
        <DropdownMenuSubTrigger className="w-full">
          <button
            ref={handleRef}
            type="button"
            className={cn(
              `
                mr-1 cursor-grab touch-none rounded-sm p-0.5
                text-muted-foreground
                hover:bg-accent hover:text-foreground
              `,
              isDragging && 'cursor-grabbing',
            )}
          >
            <GripVertical className="h-3 w-3" />
          </button>
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
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </div>
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
  const [isDragging, setIsDragging] = useState(false);
  // Unique instance ID to isolate this drag context
  const [instanceId] = useState(() => Symbol('edit-topics-instance'));

  const reorderTopics = useCallback(
    ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number;
      indexOfTarget: number;
      closestEdgeOfTarget: Edge | null;
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: 'vertical',
      });

      if (finishIndex === startIndex) {
        return;
      }

      const reordered = reorder({
        list: topics,
        startIndex,
        finishIndex,
      });

      onReorderTopics(reordered.map((t) => t.id));
    },
    [topics, onReorderTopics],
  );

  // Monitor for drag events at the list level
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => {
        return (
          isTopicItemData(source.data) && source.data.instanceId === instanceId
        );
      },
      onDragStart: () => {
        setIsDragging(true);
      },
      onDrop: ({ location, source }) => {
        setIsDragging(false);

        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!isTopicItemData(sourceData) || !isTopicItemData(targetData)) {
          return;
        }

        const indexOfTarget = topics.findIndex(
          (t) => t.id === targetData.topicId,
        );
        if (indexOfTarget < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        reorderTopics({
          startIndex: sourceData.index,
          indexOfTarget,
          closestEdgeOfTarget,
        });
      },
    });
  }, [instanceId, topics, reorderTopics]);

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
        {topics.map((topic, index) => (
          <DraggableTopicItem
            key={topic.id}
            topic={topic}
            index={index}
            instanceId={instanceId}
            onUpdateTopic={onUpdateTopic}
            onDeleteTopic={onDeleteTopic}
            isDraggingAny={isDragging}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EditTopicsButton(props: ComponentProps<typeof Button>) {
  return (
    <Button variant="ghost" size="sm" {...props}>
      <Palette />
      <span className="sr-only">Edit topics</span>
    </Button>
  );
}
