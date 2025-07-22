import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * @param distance Distance in meters
 * @description This function calculates the minimum acceptable cost for a given distance.
 * @returns
 */
export function calculateCost(distance: number) {
  const distanceInKm = distance / 1000;

  const cost = distanceInKm * 1.5;

  return Math.floor(cost * 100) / 100;
}
