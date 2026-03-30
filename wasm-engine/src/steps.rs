use serde::{Deserialize, Serialize};

use crate::graph::{CrossingType, Edge, PatternError, WeavingGraph};

/// 1つの編みステップ
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WeavingStep {
    /// ステップ番号（0始まり）
    pub step_index: usize,
    /// このステップで追加するエッジのID
    pub edge_id: u32,
    /// 始点ノードID
    pub from_node: u32,
    /// 終点ノードID
    pub to_node: u32,
    /// 説明テキスト
    pub description: String,
}

/// ステップ分解結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepSequence {
    /// パターン名
    pub pattern_name: String,
    /// 全ステップ
    pub steps: Vec<WeavingStep>,
    /// 総ステップ数
    pub total_steps: usize,
}

/// エッジに編み順序の優先度を付与するためのスコア計算
fn edge_priority(edge: &Edge, graph: &WeavingGraph) -> (i64, i64, u32) {
    // 1. Y座標が小さい（手前の行から）
    // 2. X座標が小さい（左から右へ）
    // 3. エッジIDの順
    let from_node = graph.nodes.iter().find(|n| n.id == edge.from_node);
    let to_node = graph.nodes.iter().find(|n| n.id == edge.to_node);

    let min_y = match (from_node, to_node) {
        (Some(f), Some(t)) => f.y.min(t.y),
        (Some(f), None) => f.y,
        (None, Some(t)) => t.y,
        (None, None) => 0.0,
    };
    let min_x = match (from_node, to_node) {
        (Some(f), Some(t)) => f.x.min(t.x),
        (Some(f), None) => f.x,
        (None, Some(t)) => t.x,
        (None, None) => 0.0,
    };

    // f64 をソート可能な整数に変換（精度0.001mm）
    let y_key = (min_y * 1000.0) as i64;
    let x_key = (min_x * 1000.0) as i64;
    (y_key, x_key, edge.id)
}

/// ステップの説明テキストを生成
fn generate_step_description(
    step_index: usize,
    edge: &Edge,
    graph: &WeavingGraph,
) -> String {
    let to_node = graph.nodes.iter().find(|n| n.id == edge.to_node);

    let crossing_text = match to_node.map(|n| n.crossing) {
        Some(CrossingType::Over) => "上を通して",
        Some(CrossingType::Under) => "下を通して",
        None => "",
    };

    format!(
        "ステップ{}: 竹ひごをノード{}からノード{}へ、{}配置",
        step_index + 1,
        edge.from_node,
        edge.to_node,
        crossing_text,
    )
}

/// グラフのエッジをトポロジカルソート的に順序付けてステップ列を生成
pub fn decompose_steps(graph: &WeavingGraph) -> Result<StepSequence, PatternError> {
    if graph.edges.is_empty() {
        return Ok(StepSequence {
            pattern_name: graph.pattern_name.clone(),
            steps: Vec::new(),
            total_steps: 0,
        });
    }

    // エッジを優先度でソート（行→列→ID順）
    let mut sorted_edges = graph.edges.clone();
    sorted_edges.sort_by_key(|e| edge_priority(e, graph));

    let steps: Vec<WeavingStep> = sorted_edges
        .iter()
        .enumerate()
        .map(|(i, edge)| {
            let description = generate_step_description(i, edge, graph);
            WeavingStep {
                step_index: i,
                edge_id: edge.id,
                from_node: edge.from_node,
                to_node: edge.to_node,
                description,
            }
        })
        .collect();

    let total_steps = steps.len();

    Ok(StepSequence {
        pattern_name: graph.pattern_name.clone(),
        steps,
        total_steps,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::patterns;

    #[test]
    fn test_decompose_gozame() {
        let graph = patterns::generate_gozame(5.0, 1.0, 4).unwrap();
        let sequence = decompose_steps(&graph).unwrap();
        assert_eq!(sequence.pattern_name, "gozame");
        assert_eq!(sequence.total_steps, graph.edges.len());
        assert_eq!(sequence.steps.len(), sequence.total_steps);
    }

    #[test]
    fn test_decompose_empty_graph() {
        let graph = WeavingGraph {
            pattern_name: "empty".to_string(),
            nodes: Vec::new(),
            edges: Vec::new(),
            bamboo_width: 5.0,
            bamboo_thickness: 1.0,
            count: 0,
        };
        let sequence = decompose_steps(&graph).unwrap();
        assert_eq!(sequence.total_steps, 0);
        assert!(sequence.steps.is_empty());
    }

    #[test]
    fn test_step_indices_sequential() {
        let graph = patterns::generate_gozame(5.0, 1.0, 3).unwrap();
        let sequence = decompose_steps(&graph).unwrap();
        for (i, step) in sequence.steps.iter().enumerate() {
            assert_eq!(step.step_index, i);
        }
    }

    #[test]
    fn test_step_descriptions_not_empty() {
        let graph = patterns::generate_gozame(5.0, 1.0, 3).unwrap();
        let sequence = decompose_steps(&graph).unwrap();
        for step in &sequence.steps {
            assert!(!step.description.is_empty());
            assert!(step.description.contains("ステップ"));
        }
    }

    #[test]
    fn test_decompose_all_patterns() {
        for pattern_name in &["mutsume", "ajiro", "gozame"] {
            let graph = patterns::generate_pattern(pattern_name, 5.0, 1.0, 4).unwrap();
            let sequence = decompose_steps(&graph).unwrap();
            assert_eq!(sequence.pattern_name, *pattern_name);
            assert_eq!(sequence.total_steps, graph.edges.len());
        }
    }

    #[test]
    fn test_step_sequence_json_roundtrip() {
        let graph = patterns::generate_gozame(5.0, 1.0, 3).unwrap();
        let sequence = decompose_steps(&graph).unwrap();
        let json = serde_json::to_string(&sequence).unwrap();
        let restored: StepSequence = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.total_steps, sequence.total_steps);
        assert_eq!(restored.steps.len(), sequence.steps.len());
    }

    #[test]
    fn test_steps_sorted_by_position() {
        let graph = patterns::generate_gozame(5.0, 1.0, 4).unwrap();
        let sequence = decompose_steps(&graph).unwrap();

        // 各ステップの始点ノードのY座標が概ね昇順であること
        let mut prev_min_y = f64::NEG_INFINITY;
        for step in &sequence.steps {
            let from_node = graph.nodes.iter().find(|n| n.id == step.from_node);
            let to_node = graph.nodes.iter().find(|n| n.id == step.to_node);
            let min_y = match (from_node, to_node) {
                (Some(f), Some(t)) => f.y.min(t.y),
                (Some(f), None) => f.y,
                (None, Some(t)) => t.y,
                (None, None) => 0.0,
            };
            assert!(min_y >= prev_min_y - 0.001, "Steps should be sorted by Y position");
            prev_min_y = min_y;
        }
    }
}
