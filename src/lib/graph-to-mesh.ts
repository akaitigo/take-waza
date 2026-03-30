/**
 * WeavingGraph → Three.js メッシュデータ変換
 *
 * グラフ構造の各ノード・エッジを3D描画用のデータに変換する。
 */

import type { WeavingEdge, WeavingGraph, WeavingNode } from "./wasm-bridge";

/** 竹のデフォルトカラー */
export const BAMBOO_COLOR = "#D4A76A";

/** ハイライトカラー（次のステップ） */
export const HIGHLIGHT_COLOR = "#FF6B35";

/** ノードマーカーのデータ */
export interface NodeMeshData {
	readonly id: number;
	readonly position: readonly [number, number, number];
	readonly isOver: boolean;
	readonly radius: number;
}

/** エッジ（竹ひご）のメッシュデータ */
export interface EdgeMeshData {
	readonly id: number;
	readonly start: readonly [number, number, number];
	readonly end: readonly [number, number, number];
	readonly width: number;
	readonly thickness: number;
	readonly midpoint: readonly [number, number, number];
	readonly length: number;
	readonly rotationY: number;
}

/** ノードをメッシュデータに変換 */
export function nodeToMeshData(node: WeavingNode, markerRadius: number): NodeMeshData {
	return {
		id: node.id,
		position: [node.x, node.z, node.y],
		isOver: node.crossing === "over",
		radius: markerRadius,
	};
}

/** エッジをメッシュデータに変換 */
export function edgeToMeshData(edge: WeavingEdge, nodes: ReadonlyMap<number, WeavingNode>): EdgeMeshData | undefined {
	const fromNode = nodes.get(edge.from_node);
	const toNode = nodes.get(edge.to_node);
	if (!(fromNode && toNode)) return undefined;

	const dx = toNode.x - fromNode.x;
	const dy = toNode.y - fromNode.y;
	const dz = toNode.z - fromNode.z;
	const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

	const midX = (fromNode.x + toNode.x) / 2;
	const midY = (fromNode.y + toNode.y) / 2;
	const midZ = (fromNode.z + toNode.z) / 2;

	const rotationY = Math.atan2(dx, dy);

	return {
		id: edge.id,
		start: [fromNode.x, fromNode.z, fromNode.y],
		end: [toNode.x, toNode.z, toNode.y],
		width: edge.width,
		thickness: edge.thickness,
		midpoint: [midX, midZ, midY],
		length,
		rotationY,
	};
}

/** グラフ全体をメッシュデータに変換 */
export function graphToMeshData(graph: WeavingGraph): {
	readonly nodes: readonly NodeMeshData[];
	readonly edges: readonly EdgeMeshData[];
} {
	const nodeMap = new Map<number, WeavingNode>();
	for (const node of graph.nodes) {
		nodeMap.set(node.id, node);
	}

	const markerRadius = Math.min(graph.bamboo_width, graph.bamboo_thickness) * 0.3;

	const nodeMeshes = graph.nodes.map((node) => nodeToMeshData(node, markerRadius));
	const edgeMeshes: EdgeMeshData[] = [];
	for (const edge of graph.edges) {
		const meshData = edgeToMeshData(edge, nodeMap);
		if (meshData) {
			edgeMeshes.push(meshData);
		}
	}

	return { nodes: nodeMeshes, edges: edgeMeshes };
}
