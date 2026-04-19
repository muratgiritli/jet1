import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOrderNo(id: number, isCampaign?: boolean): string {
  const padded = String(id).padStart(2, "0");
  return isCampaign ? `K${padded}` : `${id}`;
}
