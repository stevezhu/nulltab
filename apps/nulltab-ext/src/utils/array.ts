/**
 * Type guard that checks if an array has at least one element.
 *
 * This function narrows the type from `T[]` to `[T, ...T[]]`, which represents
 * a non-empty array tuple. This is useful for type-safe operations that require
 * at least one element.
 *
 * @template T - The type of elements in the array
 * @param array - The array to check
 * @returns True if the array has at least one element, false otherwise
 *
 * @example
 * const items = [1, 2, 3];
 * if (hasAtLeastOne(items)) {
 *   // TypeScript now knows items is [number, ...number[]]
 *   const first = items[0]; // No undefined check needed
 * }
 */
export function hasAtLeastOne<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

export function* reverseIterator<T>(array: T[]): IterableIterator<T> {
  for (let i = array.length - 1; i >= 0; i--) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    yield array[i]!;
  }
}
