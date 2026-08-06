import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countOccurrences(values: readonly string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => ({
    ...counts,
    [value]: (counts[value] ?? 0) + 1,
  }), {})
}
