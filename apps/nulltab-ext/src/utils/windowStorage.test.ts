import { Value } from 'typebox/value';
import { expect, test } from 'vitest';

import { ClosedWindow, ClosedWindowSchema } from './windowStorage';

test('ClosedWindowSchema serializes correctly', () => {
  const closedWindow: ClosedWindow = {
    id: '1',
    originalWindowId: 1,
    tabs: [],
    closedAt: new Date('2025-01-01'),
  };
  expect(
    JSON.stringify(Value.Encode(ClosedWindowSchema, closedWindow)),
  ).toEqual(
    '{"id":"1","originalWindowId":1,"tabs":[],"closedAt":1735689600000}',
  );
});
