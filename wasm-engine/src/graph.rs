use serde::{Deserialize, Serialize};

/// 交差タイプ: 竹ひごが上を通るか下を通るか
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CrossingType {
    Over,
    Under,
}

/// ノード: 竹ひごの交差点
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: u32,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub crossing: CrossingType,
}

/// エッジ: 竹ひご（ノード間の接続）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub id: u32,
    pub from_node: u32,
    pub to_node: u32,
    pub width: f64,
    pub thickness: f64,
}

/// 編みパターンのグラフ構造
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeavingGraph {
    pub pattern_name: String,
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
    pub bamboo_width: f64,
    pub bamboo_thickness: f64,
    pub count: u32,
}

/// パターン生成エラー
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternError {
    pub message: String,
}

impl std::fmt::Display for PatternError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "PatternError: {}", self.message)
    }
}

/// パターンの本数上限。
/// TypeScript 側 (wasm-bridge.ts MAX_COUNT) と統一する。
/// Three.js のメッシュ数爆発を防ぐためのパフォーマンス制限。
pub const MAX_COUNT: u32 = 50;

impl WeavingGraph {
    /// パラメータのバリデーション
    pub fn validate_params(width: f64, thickness: f64, count: u32) -> Result<(), PatternError> {
        if !(0.1..=50.0).contains(&width) {
            return Err(PatternError {
                message: format!("竹ひご幅 {width}mm は範囲外です (0.1-50mm)"),
            });
        }
        if !(0.1..=10.0).contains(&thickness) {
            return Err(PatternError {
                message: format!("竹ひご厚さ {thickness}mm は範囲外です (0.1-10mm)"),
            });
        }
        if count == 0 || count > MAX_COUNT {
            return Err(PatternError {
                message: format!("本数 {count} は範囲外です (1-{MAX_COUNT})"),
            });
        }
        Ok(())
    }

    /// パラメトリック変形: 幅・厚さを変更してグラフを再計算
    pub fn with_params(&self, width: f64, thickness: f64) -> Result<WeavingGraph, PatternError> {
        Self::validate_params(width, thickness, self.count)?;

        let width_ratio = width / self.bamboo_width;
        let thickness_ratio = thickness / self.bamboo_thickness;

        let nodes = self
            .nodes
            .iter()
            .map(|n| Node {
                id: n.id,
                x: n.x * width_ratio,
                y: n.y * width_ratio,
                z: n.z * thickness_ratio,
                crossing: n.crossing,
            })
            .collect();

        let edges = self
            .edges
            .iter()
            .map(|e| Edge {
                id: e.id,
                from_node: e.from_node,
                to_node: e.to_node,
                width,
                thickness,
            })
            .collect();

        Ok(WeavingGraph {
            pattern_name: self.pattern_name.clone(),
            nodes,
            edges,
            bamboo_width: width,
            bamboo_thickness: thickness,
            count: self.count,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crossing_type_serde() {
        let over = CrossingType::Over;
        let json = serde_json::to_string(&over).unwrap();
        assert_eq!(json, r#""over""#);

        let under: CrossingType = serde_json::from_str(r#""under""#).unwrap();
        assert_eq!(under, CrossingType::Under);
    }

    #[test]
    fn test_validate_params_ok() {
        assert!(WeavingGraph::validate_params(5.0, 1.0, 10).is_ok());
        assert!(WeavingGraph::validate_params(0.1, 0.1, 1).is_ok());
        assert!(WeavingGraph::validate_params(50.0, 10.0, MAX_COUNT).is_ok());
    }

    #[test]
    fn test_validate_params_width_out_of_range() {
        assert!(WeavingGraph::validate_params(0.0, 1.0, 10).is_err());
        assert!(WeavingGraph::validate_params(51.0, 1.0, 10).is_err());
    }

    #[test]
    fn test_validate_params_thickness_out_of_range() {
        assert!(WeavingGraph::validate_params(5.0, 0.0, 10).is_err());
        assert!(WeavingGraph::validate_params(5.0, 11.0, 10).is_err());
    }

    #[test]
    fn test_validate_params_count_out_of_range() {
        assert!(WeavingGraph::validate_params(5.0, 1.0, 0).is_err());
        assert!(WeavingGraph::validate_params(5.0, 1.0, MAX_COUNT + 1).is_err());
    }

    #[test]
    fn test_with_params() {
        let graph = WeavingGraph {
            pattern_name: "test".to_string(),
            nodes: vec![
                Node {
                    id: 0,
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    crossing: CrossingType::Over,
                },
                Node {
                    id: 1,
                    x: 5.0,
                    y: 5.0,
                    z: 1.0,
                    crossing: CrossingType::Under,
                },
            ],
            edges: vec![Edge {
                id: 0,
                from_node: 0,
                to_node: 1,
                width: 5.0,
                thickness: 1.0,
            }],
            bamboo_width: 5.0,
            bamboo_thickness: 1.0,
            count: 10,
        };

        let scaled = graph.with_params(10.0, 2.0).unwrap();
        assert_eq!(scaled.bamboo_width, 10.0);
        assert_eq!(scaled.bamboo_thickness, 2.0);
        // Node 1: x=5*2=10, y=5*2=10, z=1*2=2
        assert!((scaled.nodes[1].x - 10.0).abs() < f64::EPSILON);
        assert!((scaled.nodes[1].y - 10.0).abs() < f64::EPSILON);
        assert!((scaled.nodes[1].z - 2.0).abs() < f64::EPSILON);
        assert_eq!(scaled.edges[0].width, 10.0);
    }

    #[test]
    fn test_graph_serde_roundtrip() {
        let graph = WeavingGraph {
            pattern_name: "mutsume".to_string(),
            nodes: vec![Node {
                id: 0,
                x: 1.0,
                y: 2.0,
                z: 0.5,
                crossing: CrossingType::Over,
            }],
            edges: vec![Edge {
                id: 0,
                from_node: 0,
                to_node: 0,
                width: 5.0,
                thickness: 1.0,
            }],
            bamboo_width: 5.0,
            bamboo_thickness: 1.0,
            count: 6,
        };

        let json = serde_json::to_string(&graph).unwrap();
        let restored: WeavingGraph = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.pattern_name, "mutsume");
        assert_eq!(restored.nodes.len(), 1);
        assert_eq!(restored.edges.len(), 1);
    }
}
