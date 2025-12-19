import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { Button } from '@workspace/shadcn/components/button';
import { Input } from '@workspace/shadcn/components/input';
import { Label } from '@workspace/shadcn/components/label';
import { cn } from '@workspace/shadcn/lib/utils';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { topicsKeys, topicsQueryOptions } from '#api/queryOptions/topics.js';
import { topicStorage } from '#api/storage/topicStorage.js';
import { Topic } from '#models/index.js';

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

export function TopicsSection() {
  const queryClient = useQueryClient();
  const { data: topics } = useSuspenseQuery(topicsQueryOptions);

  const createTopic = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      topicStorage.saveTopic(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  const updateTopic = useMutation({
    mutationFn: (topic: Topic) => topicStorage.updateTopic(topic),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: (id: string) => topicStorage.deleteTopic(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKeys.root });
    },
  });

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicColor, setNewTopicColor] = useState(TOPIC_COLORS[0]);

  const handleCreateTopic = () => {
    if (newTopicName.trim()) {
      createTopic.mutate({ name: newTopicName.trim(), color: newTopicColor });
      setNewTopicName('');
      setNewTopicColor(TOPIC_COLORS[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`
            scroll-m-20 pb-2 text-3xl font-semibold tracking-tight
            first:mt-0
          `}
        >
          Topics
        </h2>
        <p className="text-sm text-muted-foreground">
          Create and manage topics to organize your tabs
        </p>
      </div>

      {/* Create new topic */}
      <div className="space-y-3 rounded-lg border p-4">
        <Label className="text-sm font-medium">Create new topic</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Topic name..."
            value={newTopicName}
            onChange={(e) => {
              setNewTopicName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateTopic();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleCreateTopic}
            disabled={!newTopicName.trim()}
            size="sm"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Color:</span>
          <div className="flex gap-1.5">
            {TOPIC_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  'h-5 w-5 rounded-full transition-all',
                  newTopicColor === color
                    ? 'ring-2 ring-offset-2 ring-offset-background'
                    : 'hover:scale-110',
                )}
                style={{
                  backgroundColor: color,
                  // @ts-expect-error - CSS custom property for Tailwind ring color
                  '--tw-ring-color': color,
                }}
                onClick={() => {
                  setNewTopicColor(color);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Existing topics */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Your topics ({topics.length})
        </Label>
        {topics.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No topics yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                onUpdate={(updated) => {
                  updateTopic.mutate(updated);
                }}
                onDelete={() => {
                  deleteTopic.mutate(topic.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicRow({
  topic,
  onUpdate,
  onDelete,
}: {
  topic: Topic;
  onUpdate: (topic: Topic) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [editColor, setEditColor] = useState(topic.color || TOPIC_COLORS[0]);

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate({ ...topic, name: editName.trim(), color: editColor });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(topic.name);
    setEditColor(topic.color || TOPIC_COLORS[0]);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex gap-2">
          <Input
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" onClick={handleSave} disabled={!editName.trim()}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Color:</span>
          <div className="flex gap-1.5">
            {TOPIC_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  'h-5 w-5 rounded-full transition-all',
                  editColor === color
                    ? 'ring-2 ring-offset-2 ring-offset-background'
                    : 'hover:scale-110',
                )}
                style={{
                  backgroundColor: color,
                  // @ts-expect-error - CSS custom property for Tailwind ring color
                  '--tw-ring-color': color,
                }}
                onClick={() => {
                  setEditColor(color);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: topic.color || '#888' }}
      />
      <span className="flex-1 truncate">{topic.name}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setIsEditing(true);
        }}
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className={`
          h-8 w-8 p-0 text-destructive
          hover:text-destructive
        `}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
