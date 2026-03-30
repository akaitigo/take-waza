/**
 * CrossingMarker: 交差点ノードを小さな球体で表示するコンポーネント
 */

import { useRef } from "react";
import type { Mesh } from "three";
import type { NodeMeshData } from "../lib/graph-to-mesh";

interface CrossingMarkerProps {
	readonly node: NodeMeshData;
	readonly opacity?: number;
}

const OVER_COLOR = "#8B4513";
const UNDER_COLOR = "#DAA520";

export function CrossingMarker({ node, opacity = 1 }: CrossingMarkerProps) {
	const meshRef = useRef<Mesh>(null);
	const color = node.isOver ? OVER_COLOR : UNDER_COLOR;

	return (
		<mesh ref={meshRef} position={[...node.position]}>
			<sphereGeometry args={[node.radius, 8, 8]} />
			<meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
		</mesh>
	);
}
