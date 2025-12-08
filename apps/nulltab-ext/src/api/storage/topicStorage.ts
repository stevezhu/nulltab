import { nanoid } from 'nanoid';
import { storage } from 'wxt/utils/storage';

import { type TabTopicAssignments, type Topic } from '#models/index.js';

// Define storage items using WXT storage API
const topicsStorage = storage.defineItem<Topic[]>('local:topics', {
  fallback: [],
});

const tabAssignmentsStorage = storage.defineItem<TabTopicAssignments>(
  'local:tabTopicAssignments',
  {
    fallback: {},
  },
);

export interface TopicStorage {
  // Topic CRUD
  getTopics(): Promise<Topic[]>;
  saveTopic(topic: Omit<Topic, 'id'>): Promise<Topic>;
  updateTopic(topic: Topic): Promise<void>;
  deleteTopic(id: string): Promise<void>;

  // Tab assignments
  getTabAssignments(): Promise<TabTopicAssignments>;
  assignTabToTopic(tabUrl: string, topicId: string): Promise<void>;
  removeTabAssignment(tabUrl: string): Promise<void>;
}

export class LocalStorageTopicStorage implements TopicStorage {
  async getTopics(): Promise<Topic[]> {
    return topicsStorage.getValue();
  }

  async saveTopic(topicData: Omit<Topic, 'id'>): Promise<Topic> {
    const topic: Topic = {
      ...topicData,
      id: nanoid(),
    };

    const existingTopics = await this.getTopics();
    await topicsStorage.setValue([...existingTopics, topic]);

    return topic;
  }

  async updateTopic(topic: Topic): Promise<void> {
    const existingTopics = await this.getTopics();
    const updatedTopics = existingTopics.map((t) =>
      t.id === topic.id ? topic : t,
    );

    await topicsStorage.setValue(updatedTopics);
  }

  async deleteTopic(id: string): Promise<void> {
    // Remove topic
    const existingTopics = await this.getTopics();
    const updatedTopics = existingTopics.filter((t) => t.id !== id);
    await topicsStorage.setValue(updatedTopics);

    // Remove all tab assignments for this topic
    const assignments = await this.getTabAssignments();
    const updatedAssignments: TabTopicAssignments = {};
    for (const [url, topicId] of Object.entries(assignments)) {
      if (topicId !== id) {
        updatedAssignments[url] = topicId;
      }
    }
    await tabAssignmentsStorage.setValue(updatedAssignments);
  }

  async getTabAssignments(): Promise<TabTopicAssignments> {
    return tabAssignmentsStorage.getValue();
  }

  async assignTabToTopic(tabUrl: string, topicId: string): Promise<void> {
    const assignments = await this.getTabAssignments();
    await tabAssignmentsStorage.setValue({ ...assignments, [tabUrl]: topicId });
  }

  async removeTabAssignment(tabUrl: string): Promise<void> {
    const assignments = await this.getTabAssignments();
    const { [tabUrl]: _, ...updatedAssignments } = assignments;

    await tabAssignmentsStorage.setValue(updatedAssignments);
  }
}

// Export a singleton instance
export const topicStorage = new LocalStorageTopicStorage();
