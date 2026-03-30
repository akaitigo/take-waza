use wasm_bindgen::prelude::*;

/// WASM エンジンの初期化確認用
#[wasm_bindgen]
pub fn ping() -> String {
    "take-waza wasm-engine v0.1.0".to_string()
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
}
