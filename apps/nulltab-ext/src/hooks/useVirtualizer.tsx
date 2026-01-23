import { useVirtualizer as useTanstackVirtualizer } from '@tanstack/react-virtual';

export function useVirtualizer<
  TScrollElement extends Element,
  TItemElement extends Element,
>(
  options: Parameters<
    typeof useTanstackVirtualizer<TScrollElement, TItemElement>
  >[0],
) {
  'use no memo';

  const { getVirtualItems, getTotalSize, measureElement } =
    useTanstackVirtualizer<TScrollElement, TItemElement>(options);

  return {
    virtualItems: getVirtualItems(),
    totalSize: getTotalSize() /*...and whatever else you need*/,
    measureElement,
  };
}
