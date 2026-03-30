/**
 * WeavingScene: 編みパターンの3Dシーン全体を管理するコンポーネント
 *
 * WeavingGraph を受け取り、ノード・エッジをメッシュに変換して描画する。
 */

import { useMemo } from "react";
import { graphToMeshData } from "../lib/graph-to-mesh";
import type { WeavingGraph } from "../lib/wasm-bridge";
import { BambooStrip } from "./BambooStrip";
import { CrossingMarker } from "./CrossingMarker";

interface WeavingSceneProps {
	readonly graph: WeavingGraph;
}

export function WeavingScene({ graph }: WeavingSceneProps) {
	const meshData = useMemo(() => graphToMeshData(graph), [graph]);

	return (
		<group>
			{meshData.edges.map((edge) => (
				<BambooStrip key={`edge-${String(edge.id)}`} edge={edge} />
			))}
			{meshData.nodes.map((node) => (
				<CrossingMarker key={`node-${String(node.id)}`} node={node} />
			))}
		</group>
	);
}
