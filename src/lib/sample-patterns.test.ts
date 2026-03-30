import { describe, expect, it } from "vitest";
import {
	generateSampleAjiro,
	generateSampleGozame,
	generateSampleMutsume,
	generateSamplePattern,
} from "./sample-patterns";

describe("generateSampleGozame", () => {
	it("ござ目パターンを正しく生成する", () => {
		const graph = generateSampleGozame(5, 1, 4);
		expect(graph.pattern_name).toBe("gozame");
		expect(graph.nodes).toHaveLength(16);
		expect(graph.edges.length).toBeGreaterThan(0);
		expect(graph.bamboo_width).toBe(5);
		expect(graph.bamboo_thickness).toBe(1);
	});

	it("交差タイプがチェッカーボードになる", () => {
		const graph = generateSampleGozame(5, 1, 4);
		const overCount = graph.nodes.filter((n) => n.crossing === "over").length;
		const underCount = graph.nodes.filter((n) => n.crossing === "under").length;
		expect(overCount).toBe(8);
		expect(underCount).toBe(8);
	});
});

describe("generateSampleAjiro", () => {
	it("網代パターンを正しく生成する", () => {
		const graph = generateSampleAjiro(5, 1, 4);
		expect(graph.pattern_name).toBe("ajiro");
		expect(graph.nodes).toHaveLength(16);
		expect(graph.edges.length).toBeGreaterThan(0);
	});
});

describe("generateSampleMutsume", () => {
	it("六つ目パターンを正しく生成する", () => {
		const graph = generateSampleMutsume(5, 1, 4);
		expect(graph.pattern_name).toBe("mutsume");
		expect(graph.nodes).toHaveLength(16);
		// グリッドエッジ + 斜めエッジがある
		expect(graph.edges.length).toBeGreaterThan(16);
	});
});

describe("generateSamplePattern", () => {
	it("パターン名でディスパッチできる", () => {
		expect(generateSamplePattern("gozame", 5, 1, 4).pattern_name).toBe("gozame");
		expect(generateSamplePattern("ajiro", 5, 1, 4).pattern_name).toBe("ajiro");
		expect(generateSamplePattern("mutsume", 5, 1, 4).pattern_name).toBe("mutsume");
	});
});
