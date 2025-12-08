import { nanoid } from 'nanoid';
import { Value } from 'typebox/value';
import { browser } from 'wxt/browser';

import {
  type TabTopicAssignments,
  type Topic,
  TopicSchema,
} from '#models/index.js';

const TOPICS_KEY = 'topics';
const TAB_ASSIGNMENTS_KEY = 'tabTopicAssignments';

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
    const result = await browser.storage.local.get(TOPICS_KEY);
    const data: unknown = result[TOPICS_KEY] ?? [];

    const validTopics = Array.isArray(data)
      ? data.filter((item): item is Topic => Value.Check(TopicSchema, item))
      : [];

    return validTopics;
  }

  async saveTopic(topicData: Omit<Topic, 'id'>): Promise<Topic> {
    const topic: Topic = {
      ...topicData,
      id: nanoid(),
    };

    const existingTopics = await this.getTopics();
    const updatedTopics = [...existingTopics, topic];

    await browser.storage.local.set({ [TOPICS_KEY]: updatedTopics });

    return topic;
  }

  async updateTopic(topic: Topic): Promise<void> {
    const existingTopics = await this.getTopics();
    const updatedTopics = existingTopics.map((t) =>
      t.id === topic.id ? topic : t,
    );

    await browser.storage.local.set({ [TOPICS_KEY]: updatedTopics });
  }

  async deleteTopic(id: string): Promise<void> {
    // Remove topic
    const existingTopics = await this.getTopics();
    const updatedTopics = existingTopics.filter((t) => t.id !== id);
    await browser.storage.local.set({ [TOPICS_KEY]: updatedTopics });

    // Remove all tab assignments for this topic
    const assignments = await this.getTabAssignments();
    const updatedAssignments: TabTopicAssignments = {};
    for (const [url, topicId] of Object.entries(assignments)) {
      if (topicId !== id) {
        updatedAssignments[url] = topicId;
      }
    }
    await browser.storage.local.set({
      [TAB_ASSIGNMENTS_KEY]: updatedAssignments,
    });
  }

  async getTabAssignments(): Promise<TabTopicAssignments> {
    const result = await browser.storage.local.get(TAB_ASSIGNMENTS_KEY);
    const data: unknown = result[TAB_ASSIGNMENTS_KEY] ?? {};

    // Validate it's a plain object with string values
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const assignments: TabTopicAssignments = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          assignments[key] = value;
        }
      }
      return assignments;
    }

    return {};
  }

  async assignTabToTopic(tabUrl: string, topicId: string): Promise<void> {
    const assignments = await this.getTabAssignments();
    const updatedAssignments = { ...assignments, [tabUrl]: topicId };

    await browser.storage.local.set({
      [TAB_ASSIGNMENTS_KEY]: updatedAssignments,
    });
  }

  async removeTabAssignment(tabUrl: string): Promise<void> {
    const assignments = await this.getTabAssignments();
    const { [tabUrl]: _, ...updatedAssignments } = assignments;

    await browser.storage.local.set({
      [TAB_ASSIGNMENTS_KEY]: updatedAssignments,
    });
  }
}

// Export a singleton instance
export const topicStorage = new LocalStorageTopicStorage();
