/**
 * WASM エンジンとの橋渡しモジュール
 *
 * wasm-engine crate の FFI を TypeScript から呼び出すためのラッパー。
 * WASM ロードに失敗した場合は TS 側フォールバックを使用する。
 */

import type { StepSequence as WasmStepSequence } from "./step-decompose";

/** 交差タイプ */
export type CrossingType = "over" | "under";

/** ノード: 竹ひごの交差点 */
export interface WeavingNode {
	readonly id: number;
	readonly x: number;
	readonly y: number;
	readonly z: number;
	readonly crossing: CrossingType;
}

/** エッジ: 竹ひご */
export interface WeavingEdge {
	readonly id: number;
	readonly from_node: number;
	readonly to_node: number;
	readonly width: number;
	readonly thickness: number;
}

/** 編みパターンのグラフ構造 */
export interface WeavingGraph {
	readonly pattern_name: string;
	readonly nodes: readonly WeavingNode[];
	readonly edges: readonly WeavingEdge[];
	readonly bamboo_width: number;
	readonly bamboo_thickness: number;
	readonly count: number;
}

/** unknown 値からプロパティを安全に取得する */
function prop(obj: object, key: string): unknown {
	return (obj as Record<string, unknown>)[key];
}

/** WeavingNode の型ガード */
function isWeavingNode(value: unknown): value is WeavingNode {
	if (typeof value !== "object" || value === null) return false;
	return (
		typeof prop(value, "id") === "number" &&
		typeof prop(value, "x") === "number" &&
		typeof prop(value, "y") === "number" &&
		typeof prop(value, "z") === "number" &&
		(prop(value, "crossing") === "over" || prop(value, "crossing") === "under")
	);
}

/** WeavingEdge の型ガード */
function isWeavingEdge(value: unknown): value is WeavingEdge {
	if (typeof value !== "object" || value === null) return false;
	return (
		typeof prop(value, "id") === "number" &&
		typeof prop(value, "from_node") === "number" &&
		typeof prop(value, "to_node") === "number" &&
		typeof prop(value, "width") === "number" &&
		typeof prop(value, "thickness") === "number"
	);
}

/** WeavingGraph の型ガード */
export function isWeavingGraph(value: unknown): value is WeavingGraph {
	if (typeof value !== "object" || value === null) return false;
	const nodes = prop(value, "nodes");
	const edges = prop(value, "edges");
	return (
		typeof prop(value, "pattern_name") === "string" &&
		Array.isArray(nodes) &&
		nodes.every(isWeavingNode) &&
		Array.isArray(edges) &&
		edges.every(isWeavingEdge) &&
		typeof prop(value, "bamboo_width") === "number" &&
		typeof prop(value, "bamboo_thickness") === "number" &&
		typeof prop(value, "count") === "number"
	);
}

/** JSON文字列をパースし、WeavingGraph として検証する。無効な場合は null を返す */
function parseWeavingGraph(json: string): WeavingGraph | null {
	const parsed: unknown = JSON.parse(json);
	if (isWeavingGraph(parsed)) {
		return parsed;
	}
	return null;
}

/**
 * パターンの本数上限。
 * UI・wasm-bridge・Rust(graph.rs) の3箇所で統一する唯一の定義。
 * Three.jsのメッシュ数爆発を防ぐためのパフォーマンス制限。
 */
export const MAX_COUNT = 50;

/** 利用可能なパターン名 */
export const PATTERN_NAMES = ["mutsume", "ajiro", "gozame"] as const;
export type PatternName = (typeof PATTERN_NAMES)[number];

/** パターン名のバリデーション */
export function isValidPatternName(name: string): name is PatternName {
	return (PATTERN_NAMES as readonly string[]).includes(name);
}

/** WASM モジュールの型 (wasm-pack 生成) */
interface WasmModule {
	default: (input?: { module_or_path?: string } | string) => Promise<unknown>;
	generate_pattern_json: (pattern_name: string, width: number, thickness: number, count: number) => string;
	transform_pattern_json: (graph_json: string, new_width: number, new_thickness: number) => string;
	decompose_steps_json: (graph_json: string) => string;
	list_patterns: () => string;
	ping: () => string;
}

/** WASMエンジンの初期化状態 */
type WasmState =
	| { readonly status: "uninitialized" }
	| { readonly status: "loading"; readonly promise: Promise<WasmModule | null> }
	| { readonly status: "ready"; readonly module: WasmModule }
	| { readonly status: "failed"; readonly error: string };

let wasmState: WasmState = { status: "uninitialized" };

/** WASM モジュールを動的インポートで初期化する */
async function loadWasmModule(): Promise<WasmModule | null> {
	try {
		// 動的インポートで WASM バインディングをロード
		// Vite がビルド時に正しくパスを解決しバンドルに含める
		const mod = (await import("../../wasm-engine/pkg/wasm_engine.js")) as unknown as WasmModule;
		await mod.default();
		return mod;
	} catch {
		return null;
	}
}

/** WASM エンジンを初期化する。既に初期化済みなら何もしない */
export async function initWasmEngine(): Promise<boolean> {
	if (wasmState.status === "ready") return true;
	if (wasmState.status === "failed") return false;

	if (wasmState.status === "loading") {
		const result = await wasmState.promise;
		return result !== null;
	}

	const promise = loadWasmModule();
	wasmState = { status: "loading", promise };

	const mod = await promise;
	if (mod) {
		wasmState = { status: "ready", module: mod };
		return true;
	}
	wasmState = {
		status: "failed",
		error: "WASM モジュールのロードに失敗しました",
	};
	return false;
}

/** 現在 WASM が利用可能かどうか */
export function isWasmReady(): boolean {
	return wasmState.status === "ready";
}

/**
 * WASM エンジンでパターンを生成する。
 * WASM が利用不可の場合は null を返す（呼び出し側でフォールバック）。
 */
export function wasmGeneratePattern(
	patternName: PatternName,
	width: number,
	thickness: number,
	count: number,
): WeavingGraph | null {
	if (wasmState.status !== "ready") return null;
	try {
		const json = wasmState.module.generate_pattern_json(patternName, width, thickness, count);
		return parseWeavingGraph(json);
	} catch {
		return null;
	}
}

/**
 * WASM エンジンでパターンのパラメータ変換を行う。
 * WASM が利用不可の場合は null を返す。
 */
export function wasmTransformPattern(graph: WeavingGraph, newWidth: number, newThickness: number): WeavingGraph | null {
	if (wasmState.status !== "ready") return null;
	try {
		const graphJson = JSON.stringify(graph);
		const json = wasmState.module.transform_pattern_json(graphJson, newWidth, newThickness);
		return parseWeavingGraph(json);
	} catch {
		return null;
	}
}

/**
 * WASM エンジンでステップ分解を行う。
 * WASM が利用不可の場合は null を返す。
 */
export function wasmDecomposeSteps(graph: WeavingGraph): WasmStepSequence | null {
	if (wasmState.status !== "ready") return null;
	try {
		const graphJson = JSON.stringify(graph);
		const json = wasmState.module.decompose_steps_json(graphJson);
		const raw = JSON.parse(json) as {
			pattern_name: string;
			steps: readonly {
				step_index: number;
				edge_id: number;
				from_node: number;
				to_node: number;
				description: string;
			}[];
			total_steps: number;
		};
		// Rust 側の snake_case を TS 側の camelCase に変換
		return {
			patternName: raw.pattern_name,
			steps: raw.steps.map((s) => ({
				stepIndex: s.step_index,
				edgeId: s.edge_id,
				fromNode: s.from_node,
				toNode: s.to_node,
				description: s.description,
			})),
			totalSteps: raw.total_steps,
		};
	} catch {
		return null;
	}
}

/**
 * WASM エンジンの ping を呼び出す。
 * WASM が利用不可の場合は null を返す。
 */
export function wasmPing(): string | null {
	if (wasmState.status !== "ready") return null;
	try {
		return wasmState.module.ping();
	} catch {
		return null;
	}
}

/**
 * WASM エンジンで利用可能なパターン一覧を取得する。
 * WASM が利用不可の場合は null を返す。
 */
export function wasmListPatterns(): readonly string[] | null {
	if (wasmState.status !== "ready") return null;
	try {
		const json = wasmState.module.list_patterns();
		return JSON.parse(json) as string[];
	} catch {
		return null;
	}
}
