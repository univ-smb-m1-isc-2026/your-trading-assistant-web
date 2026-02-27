import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines clsx (conditional class logic) with tailwind-merge (conflict resolution).
 * Use this for all conditional or composed Tailwind class names.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-600 text-white')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
