import { describe, expect, it } from "vitest";
import { generateSampleGozame } from "./sample-patterns";
import { decomposeSteps } from "./step-decompose";
import type { WeavingGraph } from "./wasm-bridge";

describe("decomposeSteps", () => {
	it("ござ目パターンのステップ分解が正しく動作する", () => {
		const graph = generateSampleGozame(5, 1, 4);
		const sequence = decomposeSteps(graph);
		expect(sequence.patternName).toBe("gozame");
		expect(sequence.totalSteps).toBe(graph.edges.length);
		expect(sequence.steps).toHaveLength(sequence.totalSteps);
	});

	it("ステップインデックスが連番になる", () => {
		const graph = generateSampleGozame(5, 1, 3);
		const sequence = decomposeSteps(graph);
		for (const [i, step] of sequence.steps.entries()) {
			expect(step.stepIndex).toBe(i);
		}
	});

	it("各ステップに説明テキストがある", () => {
		const graph = generateSampleGozame(5, 1, 3);
		const sequence = decomposeSteps(graph);
		for (const step of sequence.steps) {
			expect(step.description).toBeTruthy();
			expect(step.description).toContain("ステップ");
		}
	});

	it("空のグラフでは空のステップ列を返す", () => {
		const graph: WeavingGraph = {
			pattern_name: "empty",
			nodes: [],
			edges: [],
			bamboo_width: 5,
			bamboo_thickness: 1,
			count: 0,
		};
		const sequence = decomposeSteps(graph);
		expect(sequence.totalSteps).toBe(0);
		expect(sequence.steps).toHaveLength(0);
	});

	it("ステップがY座標順にソートされている", () => {
		const graph = generateSampleGozame(5, 1, 4);
		const sequence = decomposeSteps(graph);
		const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

		let prevMinY = Number.NEGATIVE_INFINITY;
		for (const step of sequence.steps) {
			const fromNode = nodeMap.get(step.fromNode);
			const toNode = nodeMap.get(step.toNode);
			const minY = Math.min(fromNode?.y ?? 0, toNode?.y ?? 0);
			expect(minY).toBeGreaterThanOrEqual(prevMinY - 0.001);
			prevMinY = minY;
		}
	});
});
