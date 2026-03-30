import { describe, expect, it } from "vitest";
import { edgeToMeshData, graphToMeshData, nodeToMeshData } from "./graph-to-mesh";
import type { WeavingEdge, WeavingGraph, WeavingNode } from "./wasm-bridge";

const sampleNode: WeavingNode = {
	id: 0,
	x: 10,
	y: 20,
	z: 0.5,
	crossing: "over",
};

const sampleNodeUnder: WeavingNode = {
	id: 1,
	x: 15,
	y: 20,
	z: -0.5,
	crossing: "under",
};

describe("nodeToMeshData", () => {
	it("ノードをメッシュデータに正しく変換する", () => {
		const result = nodeToMeshData(sampleNode, 0.3);
		expect(result.id).toBe(0);
		// Three.js座標系: x→x, z→y(高さ), y→z(奥行き)
		expect(result.position).toEqual([10, 0.5, 20]);
		expect(result.isOver).toBe(true);
		expect(result.radius).toBe(0.3);
	});

	it("under ノードの isOver が false", () => {
		const result = nodeToMeshData(sampleNodeUnder, 0.3);
		expect(result.isOver).toBe(false);
	});
});

describe("edgeToMeshData", () => {
	it("エッジをメッシュデータに正しく変換する", () => {
		const nodes = new Map<number, WeavingNode>([
			[0, sampleNode],
			[1, sampleNodeUnder],
		]);
		const edge: WeavingEdge = {
			id: 0,
			from_node: 0,
			to_node: 1,
			width: 5,
			thickness: 1,
		};
		const result = edgeToMeshData(edge, nodes);
		expect(result).toBeDefined();
		expect(result?.id).toBe(0);
		expect(result?.width).toBe(5);
		expect(result?.thickness).toBe(1);
		expect(result?.length).toBeGreaterThan(0);
	});

	it("存在しないノードを参照するエッジは undefined を返す", () => {
		const nodes = new Map<number, WeavingNode>([[0, sampleNode]]);
		const edge: WeavingEdge = {
			id: 0,
			from_node: 0,
			to_node: 99,
			width: 5,
			thickness: 1,
		};
		const result = edgeToMeshData(edge, nodes);
		expect(result).toBeUndefined();
	});
});

describe("graphToMeshData", () => {
	it("グラフ全体を変換する", () => {
		const graph: WeavingGraph = {
			pattern_name: "test",
			nodes: [sampleNode, sampleNodeUnder],
			edges: [
				{
					id: 0,
					from_node: 0,
					to_node: 1,
					width: 5,
					thickness: 1,
				},
			],
			bamboo_width: 5,
			bamboo_thickness: 1,
			count: 2,
		};
		const result = graphToMeshData(graph);
		expect(result.nodes).toHaveLength(2);
		expect(result.edges).toHaveLength(1);
	});

	it("空のグラフでも動作する", () => {
		const graph: WeavingGraph = {
			pattern_name: "empty",
			nodes: [],
			edges: [],
			bamboo_width: 5,
			bamboo_thickness: 1,
			count: 0,
		};
		const result = graphToMeshData(graph);
		expect(result.nodes).toHaveLength(0);
		expect(result.edges).toHaveLength(0);
	});

	it("不正なエッジ参照はフィルタされる", () => {
		const graph: WeavingGraph = {
			pattern_name: "test",
			nodes: [sampleNode],
			edges: [
				{
					id: 0,
					from_node: 0,
					to_node: 99,
					width: 5,
					thickness: 1,
				},
			],
			bamboo_width: 5,
			bamboo_thickness: 1,
			count: 1,
		};
		const result = graphToMeshData(graph);
		expect(result.nodes).toHaveLength(1);
		expect(result.edges).toHaveLength(0);
	});
});
