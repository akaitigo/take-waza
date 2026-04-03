import { useCallback, useMemo, useState } from "react";
import type { PatternName } from "../lib/wasm-bridge";
import { isValidPatternName } from "../lib/wasm-bridge";

/** パラメータの型定義 */
export interface PatternParams {
	readonly pattern: PatternName;
	readonly width: number;
	readonly thickness: number;
	readonly count: number;
}

/** Maximum count to prevent Three.js mesh count explosion */
export const MAX_COUNT = 50;

/** デフォルト値 */
const DEFAULT_PARAMS: PatternParams = {
	pattern: "gozame",
	width: 5,
	thickness: 1,
	count: 10,
};

/** Mutable版のパラメータ（内部構築用） */
interface MutablePatternParams {
	pattern?: PatternName;
	width?: number;
	thickness?: number;
	count?: number;
}

/** URL クエリパラメータからパラメータを読み取る */
function parseUrlParams(): MutablePatternParams {
	if (typeof window === "undefined") return {};
	const params = new URLSearchParams(window.location.search);
	const result: MutablePatternParams = {};

	const pattern = params.get("pattern");
	if (pattern && isValidPatternName(pattern)) {
		result.pattern = pattern;
	}

	const width = params.get("width");
	if (width) {
		const parsed = Number.parseFloat(width);
		if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 20) {
			result.width = parsed;
		}
	}

	const thickness = params.get("thickness");
	if (thickness) {
		const parsed = Number.parseFloat(thickness);
		if (Number.isFinite(parsed) && parsed >= 0.5 && parsed <= 5) {
			result.thickness = parsed;
		}
	}

	const count = params.get("count");
	if (count) {
		const parsed = Number.parseInt(count, 10);
		if (Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_COUNT) {
			result.count = parsed;
		}
	}

	return result;
}

/** URL にパラメータを書き込む */
function writeUrlParams(params: PatternParams): void {
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	url.searchParams.set("pattern", params.pattern);
	url.searchParams.set("width", String(params.width));
	url.searchParams.set("thickness", String(params.thickness));
	url.searchParams.set("count", String(params.count));
	window.history.replaceState(null, "", url.toString());
}

/** パラメータ管理フック */
export function usePatternParams() {
	const initialParams = useMemo((): PatternParams => {
		const urlParams = parseUrlParams();
		return { ...DEFAULT_PARAMS, ...urlParams };
	}, []);

	const [params, setParamsRaw] = useState<PatternParams>(initialParams);

	const setParams = useCallback((update: Partial<PatternParams>) => {
		let next: PatternParams | undefined;
		setParamsRaw((prev) => {
			next = { ...prev, ...update };
			return next;
		});
		// Side-effect outside the state updater to avoid
		// DOM mutations during React's render phase
		if (next) {
			writeUrlParams(next);
		}
	}, []);

	const setPattern = useCallback(
		(pattern: PatternName) => {
			setParams({ pattern });
		},
		[setParams],
	);

	const setWidth = useCallback(
		(width: number) => {
			setParams({ width: Math.min(20, Math.max(1, width)) });
		},
		[setParams],
	);

	const setThickness = useCallback(
		(thickness: number) => {
			setParams({ thickness: Math.min(5, Math.max(0.5, thickness)) });
		},
		[setParams],
	);

	const setCount = useCallback(
		(count: number) => {
			setParams({ count: Math.min(MAX_COUNT, Math.max(1, Math.round(count))) });
		},
		[setParams],
	);

	return {
		params,
		setPattern,
		setWidth,
		setThickness,
		setCount,
	};
}
