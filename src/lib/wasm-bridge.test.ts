import { describe, expect, it } from "vitest";
import { isValidPatternName, PATTERN_NAMES, type PatternName } from "./wasm-bridge";

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
