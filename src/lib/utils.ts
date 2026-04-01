import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  if (Number.isInteger(n)) return n.toLocaleString('en-IN');
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
