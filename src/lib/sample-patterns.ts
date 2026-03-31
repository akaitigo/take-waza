/**
 * サンプルパターン生成（TypeScript側スタブ）
 *
 * WASM ロードが完了するまでのフォールバックとして、
 * TS で簡易的なパターンデータを生成する。
 */

import type { CrossingType, PatternName, WeavingEdge, WeavingGraph, WeavingNode } from "./wasm-bridge";

/** ヘルパー: グリッドの横・縦エッジを生成 */
function generateGridEdges(rows: number, cols: number, width: number, thickness: number, startEdgeId: number) {
	const edges: WeavingEdge[] = [];
	let edgeId = startEdgeId;

	// 横方向エッジ
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols - 1; col++) {
			edges.push({
				id: edgeId,
				from_node: row * cols + col,
				to_node: row * cols + col + 1,
				width,
				thickness,
			});
			edgeId++;
		}
	}

	// 縦方向エッジ
	for (let row = 0; row < rows - 1; row++) {
		for (let col = 0; col < cols; col++) {
			edges.push({
				id: edgeId,
				from_node: row * cols + col,
				to_node: (row + 1) * cols + col,
				width,
				thickness,
			});
			edgeId++;
		}
	}

	return edges;
}

/** ござ目編み（plain weave）のサンプル生成 */
export function generateSampleGozame(width: number, thickness: number, count: number): WeavingGraph {
	const nodes: WeavingNode[] = [];
	let nodeId = 0;
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

	const edges = generateGridEdges(count, count, width, thickness, 0);

	return {
		pattern_name: "gozame",
		nodes,
		edges,
		bamboo_width: width,
		bamboo_thickness: thickness,
		count,
	};
}

/** 網代編み（twill weave）のサンプル生成 */
export function generateSampleAjiro(width: number, thickness: number, count: number): WeavingGraph {
	const nodes: WeavingNode[] = [];
	let nodeId = 0;
	const spacing = width;

	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count; col++) {
			const patternPos = (row + col) % 4;
			const crossing: CrossingType = patternPos < 2 ? "over" : "under";
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

	const edges = generateGridEdges(count, count, width, thickness, 0);

	return {
		pattern_name: "ajiro",
		nodes,
		edges,
		bamboo_width: width,
		bamboo_thickness: thickness,
		count,
	};
}

/** ヘルパー: 六つ目ノード生成 */
function generateHexNodes(count: number, spacing: number, hexHeight: number, thickness: number): WeavingNode[] {
	const nodes: WeavingNode[] = [];
	let nodeId = 0;
	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count; col++) {
			const xOffset = row % 2 === 1 ? spacing * 0.5 : 0;
			const crossing: CrossingType = (row + col) % 2 === 0 ? "over" : "under";
			const z = crossing === "over" ? thickness * 0.5 : -thickness * 0.5;
			nodes.push({
				id: nodeId,
				x: col * spacing + xOffset,
				y: row * hexHeight * 0.5,
				z,
				crossing,
			});
			nodeId++;
		}
	}
	return nodes;
}

/** ヘルパー: 斜めエッジ生成 */
function generateDiagonalEdges(count: number, width: number, thickness: number, startId: number): WeavingEdge[] {
	const edges: WeavingEdge[] = [];
	let edgeId = startId;
	for (let row = 0; row < count - 1; row++) {
		for (let col = 0; col < count; col++) {
			const neighborCol = row % 2 === 0 ? col - 1 : col + 1;
			if (neighborCol < 0 || neighborCol >= count) continue;
			edges.push({
				id: edgeId,
				from_node: row * count + col,
				to_node: (row + 1) * count + neighborCol,
				width,
				thickness,
			});
			edgeId++;
		}
	}
	return edges;
}

/** 六つ目編み（hexagonal）のサンプル生成 */
export function generateSampleMutsume(width: number, thickness: number, count: number): WeavingGraph {
	const spacing = width * 1.5;
	const hexHeight = spacing * Math.sqrt(3);
	const nodes = generateHexNodes(count, spacing, hexHeight, thickness);
	const gridEdges = generateGridEdges(count, count, width, thickness, 0);
	const diagonalEdges = generateDiagonalEdges(count, width, thickness, gridEdges.length);
	const edges = [...gridEdges, ...diagonalEdges];

	return {
		pattern_name: "mutsume",
		nodes,
		edges,
		bamboo_width: width,
		bamboo_thickness: thickness,
		count,
	};
}

/** パターン名からサンプル生成関数にディスパッチ */
export function generateSamplePattern(
	name: PatternName,
	width: number,
	thickness: number,
	count: number,
): WeavingGraph {
	switch (name) {
		case "mutsume":
			return generateSampleMutsume(width, thickness, count);
		case "ajiro":
			return generateSampleAjiro(width, thickness, count);
		case "gozame":
			return generateSampleGozame(width, thickness, count);
	}
}
