/**
 * 編みステップの分解ロジック（TypeScript側フォールバック）
 *
 * WASM 版が利用可能になるまでの TS 実装。
 * エッジをY座標→X座標→ID順にソートしてステップ列を生成する。
 */

import type { WeavingGraph } from "./wasm-bridge";

/** 1つの編みステップ */
export interface WeavingStep {
	readonly stepIndex: number;
	readonly edgeId: number;
	readonly fromNode: number;
	readonly toNode: number;
	readonly description: string;
}

/** ステップ分解結果 */
export interface StepSequence {
	readonly patternName: string;
	readonly steps: readonly WeavingStep[];
	readonly totalSteps: number;
}

/** ステップの説明テキスト生成 */
function generateDescription(stepIndex: number, fromNode: number, toNode: number, graph: WeavingGraph): string {
	const target = graph.nodes.find((n) => n.id === toNode);
	const crossingText = target?.crossing === "over" ? "上を通して" : "下を通して";
	return `ステップ${stepIndex + 1}: 竹ひごをノード${fromNode}からノード${toNode}へ、${crossingText}配置`;
}

/** グラフからステップ列を生成 */
export function decomposeSteps(graph: WeavingGraph): StepSequence {
	if (graph.edges.length === 0) {
		return { patternName: graph.pattern_name, steps: [], totalSteps: 0 };
	}

	const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

	// エッジを位置でソート
	const sortedEdges = [...graph.edges].sort((a, b) => {
		const aFrom = nodeMap.get(a.from_node);
		const aTo = nodeMap.get(a.to_node);
		const bFrom = nodeMap.get(b.from_node);
		const bTo = nodeMap.get(b.to_node);

		const aMinY = Math.min(aFrom?.y ?? 0, aTo?.y ?? 0);
		const bMinY = Math.min(bFrom?.y ?? 0, bTo?.y ?? 0);
		if (aMinY !== bMinY) return aMinY - bMinY;

		const aMinX = Math.min(aFrom?.x ?? 0, aTo?.x ?? 0);
		const bMinX = Math.min(bFrom?.x ?? 0, bTo?.x ?? 0);
		if (aMinX !== bMinX) return aMinX - bMinX;

		return a.id - b.id;
	});

	const steps: WeavingStep[] = sortedEdges.map((edge, i) => ({
		stepIndex: i,
		edgeId: edge.id,
		fromNode: edge.from_node,
		toNode: edge.to_node,
		description: generateDescription(i, edge.from_node, edge.to_node, graph),
	}));

	return {
		patternName: graph.pattern_name,
		steps,
		totalSteps: steps.length,
	};
}
