import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dedup<T>(arr: T[], getKey: (t: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter(i => {
    const key = getKey(i);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
