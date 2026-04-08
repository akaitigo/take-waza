/**
 * 竹ひごパラメータのバリデーション
 */

import { MAX_COUNT } from "./wasm-bridge";

export function clampWidth(value: number): number {
	return Math.min(20, Math.max(1, value));
}

export function clampThickness(value: number): number {
	return Math.min(5, Math.max(0.5, value));
}

export function clampCount(value: number): number {
	return Math.min(MAX_COUNT, Math.max(1, Math.round(value)));
}
