/**
 * BambooStrip: 竹ひご1本を3Dで描画するコンポーネント
 *
 * エッジデータから竹ひご形状（直方体）を生成し、
 * 始点→終点に向けて配置する。
 */

import { useRef } from "react";
import type { Mesh } from "three";
import type { EdgeMeshData } from "../lib/graph-to-mesh";
import { BAMBOO_COLOR } from "../lib/graph-to-mesh";

interface BambooStripProps {
	readonly edge: EdgeMeshData;
	readonly opacity?: number | undefined;
	readonly color?: string | undefined;
}

export function BambooStrip({ edge, opacity = 1, color = BAMBOO_COLOR }: BambooStripProps) {
	const meshRef = useRef<Mesh>(null);

	const [sx, sy, sz] = edge.start;
	const [ex, ey, ez] = edge.end;

	// 中点に配置
	const posX = (sx + ex) / 2;
	const posY = (sy + ey) / 2;
	const posZ = (sz + ez) / 2;

	// 向きを計算
	const dx = ex - sx;
	const dy = ey - sy;
	const dz = ez - sz;
	const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

	// 竹ひごの寸法
	const scaleX = edge.width * 0.8;
	const scaleY = edge.thickness * 0.8;
	const scaleZ = len;

	// Y軸回転とX軸回転で向きを合わせる
	const rotY = Math.atan2(dx, dz);
	const horizontalDist = Math.sqrt(dx * dx + dz * dz);
	const rotX = -Math.atan2(dy, horizontalDist);

	return (
		<mesh ref={meshRef} position={[posX, posY, posZ]} rotation={[rotX, rotY, 0]}>
			<boxGeometry args={[scaleX, scaleY, scaleZ]} />
			<meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
		</mesh>
	);
}
