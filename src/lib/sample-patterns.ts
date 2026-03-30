/**
 * サンプルパターン生成（TypeScript側スタブ）
 *
 * WASM ロードが完了するまでのフォールバックとして、
 * TS で簡易的なパターンデータを生成する。
 */

import type { CrossingType, WeavingGraph } from "./wasm-bridge";

/** ござ目編み（plain weave）のサンプル生成 */
export function generateSampleGozame(width: number, thickness: number, count: number): WeavingGraph {
	const nodes: WeavingGraph["nodes"] extends readonly (infer T)[] ? T[] : never = [];
	const edges: WeavingGraph["edges"] extends readonly (infer T)[] ? T[] : never = [];

	let nodeId = 0;
	let edgeId = 0;

	const spacing = width;

	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count; col++) {
			const crossing: CrossingType = (row + col) % 2 === 0 ? "over" : "under";
			nodes.push({
				id: nodeId,
				x: col * spacing,
				y: row * spacing,
				z: crossing === "over" ? thickness * 0.5 : -thickness * 0.5,
				crossing,
			});
			nodeId++;
		}
	}

	// 横方向エッジ
	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count - 1; col++) {
			edges.push({
				id: edgeId,
				from_node: row * count + col,
				to_node: row * count + col + 1,
				width,
				thickness,
			});
			edgeId++;
		}
	}

	// 縦方向エッジ
	for (let row = 0; row < count - 1; row++) {
		for (let col = 0; col < count; col++) {
			edges.push({
				id: edgeId,
				from_node: row * count + col,
				to_node: (row + 1) * count + col,
				width,
				thickness,
			});
			edgeId++;
		}
	}

	return {
		pattern_name: "gozame",
		nodes,
		edges,
		bamboo_width: width,
		bamboo_thickness: thickness,
		count,
	};
}
