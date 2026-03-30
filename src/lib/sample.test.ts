import { describe, expect, it } from "vitest";
import { clampCount, clampThickness, clampWidth } from "./sample";

describe("clampWidth", () => {
	it("範囲内の値はそのまま返す", () => {
		expect(clampWidth(5)).toBe(5);
		expect(clampWidth(1)).toBe(1);
		expect(clampWidth(20)).toBe(20);
	});

	it("下限未満は1にクランプ", () => {
		expect(clampWidth(0)).toBe(1);
		expect(clampWidth(-5)).toBe(1);
	});

	it("上限超過は20にクランプ", () => {
		expect(clampWidth(25)).toBe(20);
		expect(clampWidth(100)).toBe(20);
	});
});

describe("clampThickness", () => {
	it("範囲内の値はそのまま返す", () => {
		expect(clampThickness(1)).toBe(1);
		expect(clampThickness(0.5)).toBe(0.5);
		expect(clampThickness(5)).toBe(5);
	});

	it("下限未満は0.5にクランプ", () => {
		expect(clampThickness(0)).toBe(0.5);
		expect(clampThickness(0.1)).toBe(0.5);
	});

	it("上限超過は5にクランプ", () => {
		expect(clampThickness(10)).toBe(5);
	});
});

describe("clampCount", () => {
	it("整数はそのまま返す", () => {
		expect(clampCount(10)).toBe(10);
		expect(clampCount(1)).toBe(1);
		expect(clampCount(100)).toBe(100);
	});

	it("小数は四捨五入", () => {
		expect(clampCount(5.4)).toBe(5);
		expect(clampCount(5.6)).toBe(6);
	});

	it("範囲外はクランプ", () => {
		expect(clampCount(0)).toBe(1);
		expect(clampCount(200)).toBe(100);
	});
});
