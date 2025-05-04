import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ! don't add new utils here, add them to the utils folder
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
