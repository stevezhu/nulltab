import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

import {
  CreateTopicButton,
  CreateTopicDialog,
} from '#components/CreateTopicDialog.js';
import {
  EditTopicsButton,
  EditTopicsDropdown,
} from '#components/EditTopicsDropdown/index.js';
import { MoreTopicsDropdown } from '#components/MoreTopicsDropdown.js';
import {
  TopicPill,
  TopicPillDeleteButton,
  TopicPillLabel,
} from '#components/TopicPill.js';
import { type Topic } from '#models/index.js';

/** Maximum number of topic pills to show before collapsing into dropdown */
const MAX_VISIBLE_TOPICS = 5;

// XXX: this is a workaround to avoid the type being inferred as a union of string literals
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type TopicFilterValue = 'all' | 'uncategorized' | string;

export type TopicCounts = {
  all: number;
  uncategorized: number;
  byTopic: Record<TopicFilterValue, number>;
};

export type TopicsBarProps = {
  topics: Topic[];
  counts?: TopicCounts;
  selectedTopic: TopicFilterValue;
  onSelectTopic: (topic: TopicFilterValue) => void;
  onCreateTopic: (name: string, color?: string) => void;
  onDeleteTopic: (id: string) => void;
  onUpdateTopic: (topic: Topic) => void;
  onReorderTopics: (topicIds: string[]) => void;
};

export function TopicsBar({
  topics,
  counts,
  selectedTopic,
  onSelectTopic,
  onCreateTopic,
  onDeleteTopic,
  onUpdateTopic,
  onReorderTopics,
}: TopicsBarProps) {
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
          selected={selectedTopic === 'all'}
          onClick={() => {
            onSelectTopic('all');
          }}
        >
          <TopicPillLabel count={counts?.all}>All</TopicPillLabel>
        </TopicPill>

        {/* Uncategorized */}
        <TopicPill
          selected={selectedTopic === 'uncategorized'}
          onClick={() => {
            onSelectTopic('uncategorized');
          }}
        >
          <TopicPillLabel count={counts?.uncategorized}>
            Uncategorized
          </TopicPillLabel>
        </TopicPill>

        {/* Visible user topics */}
        {visibleTopics.map((topic) => (
          <TopicPill
            key={topic.id}
            color={topic.color}
            selected={selectedTopic === topic.id}
            onClick={() => {
              onSelectTopic(topic.id);
            }}
          >
            <TopicPillLabel
              count={counts?.byTopic[topic.id]}
              color={topic.color}
              selected={selectedTopic === topic.id}
            >
              {topic.name}
            </TopicPillLabel>
            {selectedTopic === topic.id && (
              <TopicPillDeleteButton
                onClick={() => {
                  onDeleteTopic(topic.id);
                }}
              />
            )}
          </TopicPill>
        ))}

        {/* More topics dropdown - shows when there are more topics than MAX_VISIBLE_TOPICS */}
        {overflowTopics.length > 0 && (
          <MoreTopicsDropdown
            topics={overflowTopics}
            counts={counts}
            selectedTopic={selectedTopic}
            onSelectTopic={onSelectTopic}
            onDeleteTopic={onDeleteTopic}
          >
            <TopicPill
              color={selectedOverflowTopic?.color}
              selected={selectedOverflowTopic !== undefined}
            >
              {selectedOverflowTopic ? (
                <TopicPillLabel
                  count={overflowTopics.length}
                  color={selectedOverflowTopic.color}
                  selected
                >
                  {overflowTopics.length} more
                </TopicPillLabel>
              ) : (
                <>+{overflowTopics.length} more</>
              )}
              <ChevronDown className="h-3 w-3" />
            </TopicPill>
          </MoreTopicsDropdown>
        )}

        {/* Spacer to keep the spacing consistent so that the ui doesn't shift because all and
          uncategorized don't have a delete button. */}
        {(selectedTopic === 'all' || selectedTopic === 'uncategorized') && (
          <div className="w-5.5" />
        )}

        <div className="ml-auto flex items-center gap-2">
          <CreateTopicDialog onCreateTopic={onCreateTopic}>
            <CreateTopicButton size="xs" />
          </CreateTopicDialog>
          {topics.length > 0 && (
            <EditTopicsDropdown
              topics={topics}
              onUpdateTopic={onUpdateTopic}
              onDeleteTopic={onDeleteTopic}
              onReorderTopics={onReorderTopics}
            >
              <EditTopicsButton size="xs" />
            </EditTopicsDropdown>
          )}
        </div>
      </div>
    </div>
  );
}
