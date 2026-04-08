import { describe, expect, it } from "vitest";
import {
  isValidPatternName,
  isWasmReady,
  isWeavingGraph,
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

describe("isWeavingGraph", () => {
  const validGraph = {
    pattern_name: "gozame",
    nodes: [{ id: 0, x: 0, y: 0, z: 0, crossing: "over" }],
    edges: [{ id: 0, from_node: 0, to_node: 0, width: 5, thickness: 1 }],
    bamboo_width: 5,
    bamboo_thickness: 1,
    count: 10,
  };

  it("有効な WeavingGraph で true を返す", () => {
    expect(isWeavingGraph(validGraph)).toBe(true);
  });

  it("空のノード・エッジ配列でも true を返す", () => {
    expect(
      isWeavingGraph({
        ...validGraph,
        nodes: [],
        edges: [],
      }),
    ).toBe(true);
  });

  it("null で false を返す", () => {
    expect(isWeavingGraph(null)).toBe(false);
  });

  it("undefined で false を返す", () => {
    expect(isWeavingGraph(undefined)).toBe(false);
  });

  it("空オブジェクトで false を返す", () => {
    expect(isWeavingGraph({})).toBe(false);
  });

  it("pattern_name が欠落している場合 false を返す", () => {
    const { pattern_name: _, ...rest } = validGraph;
    expect(isWeavingGraph(rest)).toBe(false);
  });

  it("nodes に不正な要素がある場合 false を返す", () => {
    expect(
      isWeavingGraph({
        ...validGraph,
        nodes: [{ id: 0, x: 0, y: 0, z: 0, crossing: "invalid" }],
      }),
    ).toBe(false);
  });

  it("edges に不正な要素がある場合 false を返す", () => {
    expect(
      isWeavingGraph({
        ...validGraph,
        edges: [{ id: 0, from_node: 0, to_node: 0, width: "5", thickness: 1 }],
      }),
    ).toBe(false);
  });

  it("count が文字列の場合 false を返す", () => {
    expect(
      isWeavingGraph({
        ...validGraph,
        count: "10",
      }),
    ).toBe(false);
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
