/**
 * 竹ひごパラメータのバリデーション
 */
export function clampWidth(value: number): number {
	return Math.min(20, Math.max(1, value));
}

export function clampThickness(value: number): number {
	return Math.min(5, Math.max(0.5, value));
}

export function clampCount(value: number): number {
	return Math.min(100, Math.max(1, Math.round(value)));
}
