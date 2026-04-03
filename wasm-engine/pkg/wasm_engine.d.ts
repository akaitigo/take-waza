/* tslint:disable */
/* eslint-disable */

/**
 * グラフからステップ分解を実行して JSON で返す (WASM FFI)
 */
export function decompose_steps_json(graph_json: string): string;

/**
 * パターンを生成して JSON 文字列で返す (WASM FFI)
 *
 * # Arguments
 * * `pattern_name` - パターン名 ("mutsume", "ajiro", "gozame")
 * * `width` - 竹ひご幅 (mm, 0.1-50)
 * * `thickness` - 竹ひご厚さ (mm, 0.1-10)
 * * `count` - 本数 (1-1000)
 */
export function generate_pattern_json(pattern_name: string, width: number, thickness: number, count: number): string;

/**
 * 利用可能なパターン名一覧を JSON 配列で返す
 */
export function list_patterns(): string;

/**
 * WASM エンジンの初期化確認用
 */
export function ping(): string;

/**
 * 既存グラフのパラメータを変更して JSON で返す (WASM FFI)
 */
export function transform_pattern_json(graph_json: string, new_width: number, new_thickness: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly decompose_steps_json: (a: number, b: number) => [number, number, number, number];
    readonly generate_pattern_json: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly list_patterns: () => [number, number];
    readonly ping: () => [number, number];
    readonly transform_pattern_json: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
