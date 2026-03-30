/**
 * WASM エンジンとの橋渡しモジュール
 *
 * wasm-engine crate の FFI を TypeScript から呼び出すためのラッパー。
 * MVP段階では WASM ビルドが完了するまでスタブ実装を提供する。
 */

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

/** 利用可能なパターン名 */
export const PATTERN_NAMES = ["mutsume", "ajiro", "gozame"] as const;
export type PatternName = (typeof PATTERN_NAMES)[number];

/** パターン名のバリデーション */
export function isValidPatternName(name: string): name is PatternName {
	return (PATTERN_NAMES as readonly string[]).includes(name);
}
