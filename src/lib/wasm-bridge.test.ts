import { describe, expect, it } from "vitest";
import {
	isValidPatternName,
	isWasmReady,
	PATTERN_NAMES,
	type PatternName,
	wasmGeneratePattern,
	wasmPing,
} from "./wasm-bridge";

describe("PATTERN_NAMES", () => {
	it("3つの内蔵パターンが定義されている", () => {
		expect(PATTERN_NAMES).toHaveLength(3);
		expect(PATTERN_NAMES).toContain("mutsume");
		expect(PATTERN_NAMES).toContain("ajiro");
		expect(PATTERN_NAMES).toContain("gozame");
	});
});

describe("isValidPatternName", () => {
	it("有効なパターン名でtrueを返す", () => {
		expect(isValidPatternName("mutsume")).toBe(true);
		expect(isValidPatternName("ajiro")).toBe(true);
		expect(isValidPatternName("gozame")).toBe(true);
	});

	it("無効なパターン名でfalseを返す", () => {
		expect(isValidPatternName("unknown")).toBe(false);
		expect(isValidPatternName("")).toBe(false);
		expect(isValidPatternName("MUTSUME")).toBe(false);
	});

	it("型ガードとして機能する", () => {
		const name = "mutsume";
		if (isValidPatternName(name)) {
			const _typed: PatternName = name;
			expect(_typed).toBe("mutsume");
		}
	});
});

describe("WASM functions (テスト環境ではWASM未ロード)", () => {
	it("isWasmReady は WASM 未ロード時に false を返す", () => {
		// Vitest 環境では WASM バイナリをロードしないため false
		expect(isWasmReady()).toBe(false);
	});

	it("wasmGeneratePattern は WASM 未ロード時に null を返す", () => {
		expect(wasmGeneratePattern("gozame", 5, 1, 10)).toBeNull();
	});

	it("wasmPing は WASM 未ロード時に null を返す", () => {
		expect(wasmPing()).toBeNull();
	});
});
