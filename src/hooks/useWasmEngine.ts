/**
 * WASM エンジンの初期化と利用を管理するカスタムフック
 *
 * アプリ起動時に WASM の非同期ロードを行い、
 * ロード完了まで TS フォールバックを使用する。
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateSamplePattern } from "../lib/sample-patterns";
import {
	initWasmEngine,
	isWasmReady,
	type PatternName,
	type WeavingGraph,
	wasmGeneratePattern,
} from "../lib/wasm-bridge";

export type WasmStatus = "loading" | "ready" | "fallback";

export interface UseWasmEngineReturn {
	/** WASM エンジンの現在の状態 */
	readonly status: WasmStatus;
	/** パターンを生成する（WASM優先、フォールバックあり） */
	readonly generatePattern: (name: PatternName, width: number, thickness: number, count: number) => WeavingGraph;
}

/** WASM エンジンの初期化と利用を管理する */
export function useWasmEngine(): UseWasmEngineReturn {
	const [status, setStatus] = useState<WasmStatus>(isWasmReady() ? "ready" : "loading");

	useEffect(() => {
		if (isWasmReady()) {
			setStatus("ready");
			return;
		}

		let cancelled = false;
		initWasmEngine().then((success) => {
			if (cancelled) return;
			setStatus(success ? "ready" : "fallback");
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const generatePattern = useCallback(
		(name: PatternName, width: number, thickness: number, count: number): WeavingGraph => {
			if (status === "ready") {
				const wasmResult = wasmGeneratePattern(name, width, thickness, count);
				if (wasmResult) return wasmResult;
			}
			// フォールバック: TS 側スタブ
			return generateSamplePattern(name, width, thickness, count);
		},
		[status],
	);

	return useMemo(() => ({ status, generatePattern }), [status, generatePattern]);
}
