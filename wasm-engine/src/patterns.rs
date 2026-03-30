use crate::graph::{CrossingType, Edge, Node, PatternError, WeavingGraph};

/// 内蔵パターン名のリスト
pub const BUILTIN_PATTERNS: &[&str] = &["mutsume", "ajiro", "gozame"];

/// パターン名のバリデーション
pub fn validate_pattern_name(name: &str) -> Result<(), PatternError> {
    if BUILTIN_PATTERNS.contains(&name) {
        Ok(())
    } else {
        Err(PatternError {
            message: format!(
                "パターン '{name}' は存在しません。利用可能: {}",
                BUILTIN_PATTERNS.join(", ")
            ),
        })
    }
}

/// 六つ目編み（mutsume / hexagonal）パターン生成
///
/// 六角形の格子パターン。3方向の竹ひごが60度ずつ交差する。
pub fn generate_mutsume(width: f64, thickness: f64, count: u32) -> Result<WeavingGraph, PatternError> {
    WeavingGraph::validate_params(width, thickness, count)?;

    let mut nodes = Vec::new();
    let mut edges = Vec::new();
    let mut node_id: u32 = 0;
    let mut edge_id: u32 = 0;

    let spacing = width * 1.5;
    let hex_height = spacing * 3.0_f64.sqrt();

    let rows = count;
    let cols = count;

    // 六つ目は3方向の竹ひごが交差するパターン
    // 簡略化: 六角格子の交差点をノードとして生成
    for row in 0..rows {
        for col in 0..cols {
            let x_offset = if row % 2 == 1 { spacing * 0.5 } else { 0.0 };
            let x = col as f64 * spacing + x_offset;
            let y = row as f64 * hex_height * 0.5;
            let z = if (row + col) % 2 == 0 {
                thickness * 0.5
            } else {
                -thickness * 0.5
            };
            let crossing = if (row + col) % 2 == 0 {
                CrossingType::Over
            } else {
                CrossingType::Under
            };

            nodes.push(Node {
                id: node_id,
                x,
                y,
                z,
                crossing,
            });
            node_id += 1;
        }
    }

    // 横方向エッジ
    for row in 0..rows {
        for col in 0..(cols - 1) {
            let from = row * cols + col;
            let to = row * cols + col + 1;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    // 縦方向エッジ（斜め接続で六角形を形成）
    for row in 0..(rows - 1) {
        for col in 0..cols {
            let from = row * cols + col;
            let to = (row + 1) * cols + col;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    // 斜め方向エッジ（六角格子の第3方向）
    for row in 0..(rows - 1) {
        for col in 0..cols {
            let neighbor_col = if row % 2 == 0 {
                if col == 0 {
                    continue;
                }
                col - 1
            } else {
                if col >= cols - 1 {
                    continue;
                }
                col + 1
            };
            let from = row * cols + col;
            let to = (row + 1) * cols + neighbor_col;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    Ok(WeavingGraph {
        pattern_name: "mutsume".to_string(),
        nodes,
        edges,
        bamboo_width: width,
        bamboo_thickness: thickness,
        count,
    })
}

/// 網代編み（ajiro / twill）パターン生成
///
/// 斜めに交差する2方向の竹ひご。上下のパターンがシフトして柄を作る。
pub fn generate_ajiro(width: f64, thickness: f64, count: u32) -> Result<WeavingGraph, PatternError> {
    WeavingGraph::validate_params(width, thickness, count)?;

    let mut nodes = Vec::new();
    let mut edges = Vec::new();
    let mut node_id: u32 = 0;
    let mut edge_id: u32 = 0;

    let spacing = width;

    let rows = count;
    let cols = count;

    // 網代: 2/2 ツイルパターン（2本上、2本下の繰り返し）
    for row in 0..rows {
        for col in 0..cols {
            let x = col as f64 * spacing;
            let y = row as f64 * spacing;
            // 2/2 ツイル: 行ごとに1つずつシフト
            let pattern_pos = (row + col) % 4;
            let crossing = if pattern_pos < 2 {
                CrossingType::Over
            } else {
                CrossingType::Under
            };
            let z = if crossing == CrossingType::Over {
                thickness * 0.5
            } else {
                -thickness * 0.5
            };

            nodes.push(Node {
                id: node_id,
                x,
                y,
                z,
                crossing,
            });
            node_id += 1;
        }
    }

    // 横方向エッジ
    for row in 0..rows {
        for col in 0..(cols - 1) {
            let from = row * cols + col;
            let to = row * cols + col + 1;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    // 縦方向エッジ
    for row in 0..(rows - 1) {
        for col in 0..cols {
            let from = row * cols + col;
            let to = (row + 1) * cols + col;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    Ok(WeavingGraph {
        pattern_name: "ajiro".to_string(),
        nodes,
        edges,
        bamboo_width: width,
        bamboo_thickness: thickness,
        count,
    })
}

/// ござ目編み（gozame / plain weave）パターン生成
///
/// 最も基本的な1/1平織り。上下が交互に入れ替わる。
pub fn generate_gozame(width: f64, thickness: f64, count: u32) -> Result<WeavingGraph, PatternError> {
    WeavingGraph::validate_params(width, thickness, count)?;

    let mut nodes = Vec::new();
    let mut edges = Vec::new();
    let mut node_id: u32 = 0;
    let mut edge_id: u32 = 0;

    let spacing = width;

    let rows = count;
    let cols = count;

    // ござ目: 1/1 平織り（チェッカーボード）
    for row in 0..rows {
        for col in 0..cols {
            let x = col as f64 * spacing;
            let y = row as f64 * spacing;
            let crossing = if (row + col) % 2 == 0 {
                CrossingType::Over
            } else {
                CrossingType::Under
            };
            let z = if crossing == CrossingType::Over {
                thickness * 0.5
            } else {
                -thickness * 0.5
            };

            nodes.push(Node {
                id: node_id,
                x,
                y,
                z,
                crossing,
            });
            node_id += 1;
        }
    }

    // 横方向エッジ
    for row in 0..rows {
        for col in 0..(cols - 1) {
            let from = row * cols + col;
            let to = row * cols + col + 1;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    // 縦方向エッジ
    for row in 0..(rows - 1) {
        for col in 0..cols {
            let from = row * cols + col;
            let to = (row + 1) * cols + col;
            edges.push(Edge {
                id: edge_id,
                from_node: from,
                to_node: to,
                width,
                thickness,
            });
            edge_id += 1;
        }
    }

    Ok(WeavingGraph {
        pattern_name: "gozame".to_string(),
        nodes,
        edges,
        bamboo_width: width,
        bamboo_thickness: thickness,
        count,
    })
}

/// パターン名から生成関数にディスパッチ
pub fn generate_pattern(
    name: &str,
    width: f64,
    thickness: f64,
    count: u32,
) -> Result<WeavingGraph, PatternError> {
    validate_pattern_name(name)?;
    match name {
        "mutsume" => generate_mutsume(width, thickness, count),
        "ajiro" => generate_ajiro(width, thickness, count),
        "gozame" => generate_gozame(width, thickness, count),
        _ => Err(PatternError {
            message: format!("パターン '{name}' の生成関数が未実装です"),
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_pattern_name() {
        assert!(validate_pattern_name("mutsume").is_ok());
        assert!(validate_pattern_name("ajiro").is_ok());
        assert!(validate_pattern_name("gozame").is_ok());
        assert!(validate_pattern_name("unknown").is_err());
    }

    #[test]
    fn test_generate_mutsume() {
        let graph = generate_mutsume(5.0, 1.0, 6).unwrap();
        assert_eq!(graph.pattern_name, "mutsume");
        assert_eq!(graph.nodes.len(), 36); // 6x6
        assert!(!graph.edges.is_empty());
        // 上下両方の交差が存在する
        let has_over = graph.nodes.iter().any(|n| n.crossing == CrossingType::Over);
        let has_under = graph.nodes.iter().any(|n| n.crossing == CrossingType::Under);
        assert!(has_over);
        assert!(has_under);
    }

    #[test]
    fn test_generate_ajiro() {
        let graph = generate_ajiro(5.0, 1.0, 6).unwrap();
        assert_eq!(graph.pattern_name, "ajiro");
        assert_eq!(graph.nodes.len(), 36);
        assert!(!graph.edges.is_empty());
    }

    #[test]
    fn test_generate_gozame() {
        let graph = generate_gozame(5.0, 1.0, 6).unwrap();
        assert_eq!(graph.pattern_name, "gozame");
        assert_eq!(graph.nodes.len(), 36);
        // ござ目は完全なチェッカーボード: Over と Under が半々
        let over_count = graph
            .nodes
            .iter()
            .filter(|n| n.crossing == CrossingType::Over)
            .count();
        let under_count = graph
            .nodes
            .iter()
            .filter(|n| n.crossing == CrossingType::Under)
            .count();
        assert_eq!(over_count, 18);
        assert_eq!(under_count, 18);
    }

    #[test]
    fn test_generate_gozame_spacing() {
        let graph = generate_gozame(5.0, 1.0, 3).unwrap();
        // 3x3 grid: ノード間隔が width に等しい
        let node_1 = &graph.nodes[1]; // row=0, col=1
        assert!((node_1.x - 5.0).abs() < f64::EPSILON);
        assert!((node_1.y - 0.0).abs() < f64::EPSILON);
    }

    #[test]
    fn test_generate_pattern_dispatch() {
        assert!(generate_pattern("mutsume", 5.0, 1.0, 6).is_ok());
        assert!(generate_pattern("ajiro", 5.0, 1.0, 6).is_ok());
        assert!(generate_pattern("gozame", 5.0, 1.0, 6).is_ok());
        assert!(generate_pattern("invalid", 5.0, 1.0, 6).is_err());
    }

    #[test]
    fn test_generate_pattern_invalid_params() {
        assert!(generate_pattern("mutsume", 0.0, 1.0, 6).is_err());
        assert!(generate_pattern("mutsume", 5.0, 0.0, 6).is_err());
        assert!(generate_pattern("mutsume", 5.0, 1.0, 0).is_err());
    }

    #[test]
    fn test_pattern_json_roundtrip() {
        let graph = generate_gozame(5.0, 1.0, 4).unwrap();
        let json = serde_json::to_string(&graph).unwrap();
        let restored: WeavingGraph = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.pattern_name, "gozame");
        assert_eq!(restored.nodes.len(), graph.nodes.len());
        assert_eq!(restored.edges.len(), graph.edges.len());
    }

    #[test]
    fn test_edge_connections_valid() {
        let graph = generate_gozame(5.0, 1.0, 4).unwrap();
        let max_node_id = graph.nodes.iter().map(|n| n.id).max().unwrap();
        for edge in &graph.edges {
            assert!(
                edge.from_node <= max_node_id,
                "edge {} from_node {} > max {}",
                edge.id,
                edge.from_node,
                max_node_id
            );
            assert!(
                edge.to_node <= max_node_id,
                "edge {} to_node {} > max {}",
                edge.id,
                edge.to_node,
                max_node_id
            );
        }
    }
}
