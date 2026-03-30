/**
 * WeavingScene: 編みパターンの3Dシーン全体を管理するコンポーネント
 *
 * WeavingGraph を受け取り、ノード・エッジをメッシュに変換して描画する。
 * ステップナビゲーション連動: 完了エッジは不透明、未完了は半透明、現在ステップはハイライト。
 */

import { useMemo } from "react";
import { HIGHLIGHT_COLOR, graphToMeshData } from "../lib/graph-to-mesh";
import type { WeavingGraph } from "../lib/wasm-bridge";
import { BambooStrip } from "./BambooStrip";
import { CrossingMarker } from "./CrossingMarker";

interface WeavingSceneProps {
	readonly graph: WeavingGraph;
	readonly completedEdgeIds?: ReadonlySet<number> | undefined;
	readonly currentEdgeId?: number | undefined;
}

export function WeavingScene({ graph, completedEdgeIds, currentEdgeId }: WeavingSceneProps) {
	const meshData = useMemo(() => graphToMeshData(graph), [graph]);

	const isStepMode = completedEdgeIds !== undefined;

	return (
		<group>
			{meshData.edges.map((edge) => {
				let opacity = 1;
				let color: string | undefined;

				if (isStepMode) {
					if (edge.id === currentEdgeId) {
						color = HIGHLIGHT_COLOR;
						opacity = 1;
					} else if (completedEdgeIds.has(edge.id)) {
						opacity = 1;
					} else {
						opacity = 0.15;
					}
				}

				return <BambooStrip key={`edge-${String(edge.id)}`} edge={edge} opacity={opacity} color={color} />;
			})}
			{meshData.nodes.map((node) => (
				<CrossingMarker key={`node-${String(node.id)}`} node={node} opacity={isStepMode ? 0.3 : 1} />
			))}
		</group>
	);
}
