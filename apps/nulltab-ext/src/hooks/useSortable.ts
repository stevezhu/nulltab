import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { useEffect, useEffectEvent } from 'react';
import { flushSync } from 'react-dom';

/**
 * Reference: https://github.com/alexreardon/pdnd-react-tailwind
 * @param options
 */
export function useSortable<T, TData extends Record<string, unknown>>({
  items,
  setItems: setList,
  isSortableData,
  isMatch,
  getElement,
}: {
  items: T[];
  setItems: (list: T[]) => void;
  isSortableData: (value: Record<string, unknown>) => value is TData;
  isMatch: (item: T, data: TData) => boolean;
  getElement: (data: TData) => Element | null;
}) {
  const $setList = useEffectEvent(setList);
  const $isSortableData = useEffectEvent(isSortableData);
  const $isMatch = useEffectEvent(isMatch);
  const $getElement = useEffectEvent(getElement);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return $isSortableData(source.data);
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!$isSortableData(sourceData) || !$isSortableData(targetData)) {
          return;
        }

        const indexOfSource = items.findIndex((item) =>
          $isMatch(item, sourceData),
        );
        const indexOfTarget = items.findIndex((task) =>
          $isMatch(task, targetData),
        );

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        // Using `flushSync` so we can query the DOM straight after this line
        flushSync(() => {
          $setList(
            reorderWithEdge({
              list: items,
              startIndex: indexOfSource,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: 'vertical',
            }),
          );
        });

        // Being simple and just querying for the task after the drop.
        // We could use react context to register the element in a lookup,
        // and then we could retrieve that element after the drop and use
        // `triggerPostMoveFlash`. But this gets the job done.
        const element = $getElement(sourceData);
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }
      },
    });
  }, [items]);
}
