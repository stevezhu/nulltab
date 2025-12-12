// Symbol key for type-safe drag data
import { type Topic } from '#models/index.js';

export const topicItemKey = Symbol('topic-item');

export type TopicItemData = {
  [topicItemKey]: true;
  topicId: string;
};

export function getTopicItemData(topic: Topic): TopicItemData {
  return {
    [topicItemKey]: true,
    topicId: topic.id,
  };
}

export function isTopicItemData(
  data: Record<string | symbol, unknown>,
): data is TopicItemData {
  return data[topicItemKey] === true;
}
