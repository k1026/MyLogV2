import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * TailwindCSSのクラス名を結合・最適化するユーティリティ関数
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
