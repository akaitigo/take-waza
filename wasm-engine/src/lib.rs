pub mod graph;
pub mod patterns;

use graph::{PatternError, WeavingGraph};
use wasm_bindgen::prelude::*;

/// WASM エンジンの初期化確認用
#[wasm_bindgen]
pub fn ping() -> String {
    "take-waza wasm-engine v0.1.0".to_string()
}

/// パターンを生成して JSON 文字列で返す（内部関数）
fn generate_pattern_json_inner(
    pattern_name: &str,
    width: f64,
    thickness: f64,
    count: u32,
) -> Result<String, PatternError> {
    let graph = patterns::generate_pattern(pattern_name, width, thickness, count)?;
    serde_json::to_string(&graph).map_err(|e| PatternError {
        message: e.to_string(),
    })
}

/// パターンを生成して JSON 文字列で返す (WASM FFI)
///
/// # Arguments
/// * `pattern_name` - パターン名 ("mutsume", "ajiro", "gozame")
/// * `width` - 竹ひご幅 (mm, 0.1-50)
/// * `thickness` - 竹ひご厚さ (mm, 0.1-10)
/// * `count` - 本数 (1-1000)
#[wasm_bindgen]
pub fn generate_pattern_json(
    pattern_name: &str,
    width: f64,
    thickness: f64,
    count: u32,
) -> Result<String, JsError> {
    generate_pattern_json_inner(pattern_name, width, thickness, count)
        .map_err(|e| JsError::new(&e.message))
}

/// 既存グラフのパラメータを変更して JSON で返す（内部関数）
fn transform_pattern_json_inner(
    graph_json: &str,
    new_width: f64,
    new_thickness: f64,
) -> Result<String, PatternError> {
    let graph: WeavingGraph = serde_json::from_str(graph_json).map_err(|e| PatternError {
        message: e.to_string(),
    })?;
    let transformed = graph.with_params(new_width, new_thickness)?;
    serde_json::to_string(&transformed).map_err(|e| PatternError {
        message: e.to_string(),
    })
}

/// 既存グラフのパラメータを変更して JSON で返す (WASM FFI)
#[wasm_bindgen]
pub fn transform_pattern_json(
    graph_json: &str,
    new_width: f64,
    new_thickness: f64,
) -> Result<String, JsError> {
    transform_pattern_json_inner(graph_json, new_width, new_thickness)
        .map_err(|e| JsError::new(&e.message))
}

/// 利用可能なパターン名一覧を JSON 配列で返す
#[wasm_bindgen]
pub fn list_patterns() -> String {
    serde_json::to_string(patterns::BUILTIN_PATTERNS).unwrap_or_else(|_| "[]".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ping() {
        let result = ping();
        assert!(result.contains("take-waza"));
        assert!(result.contains("0.1.0"));
    }

    #[test]
    fn test_generate_pattern_json() {
        let json = generate_pattern_json_inner("mutsume", 5.0, 1.0, 6).unwrap();
        let graph: WeavingGraph = serde_json::from_str(&json).unwrap();
        assert_eq!(graph.pattern_name, "mutsume");
        assert!(!graph.nodes.is_empty());
        assert!(!graph.edges.is_empty());
    }

    #[test]
    fn test_generate_pattern_json_invalid() {
        let result = generate_pattern_json_inner("invalid", 5.0, 1.0, 6);
        assert!(result.is_err());
    }

    #[test]
    fn test_transform_pattern_json() {
        let original = generate_pattern_json_inner("gozame", 5.0, 1.0, 4).unwrap();
        let transformed = transform_pattern_json_inner(&original, 10.0, 2.0).unwrap();
        let graph: WeavingGraph = serde_json::from_str(&transformed).unwrap();
        assert_eq!(graph.bamboo_width, 10.0);
        assert_eq!(graph.bamboo_thickness, 2.0);
    }

    #[test]
    fn test_list_patterns() {
        let json = list_patterns();
        let patterns: Vec<String> = serde_json::from_str(&json).unwrap();
        assert!(patterns.contains(&"mutsume".to_string()));
        assert!(patterns.contains(&"ajiro".to_string()));
        assert!(patterns.contains(&"gozame".to_string()));
    }
}
