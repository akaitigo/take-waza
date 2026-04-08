/**
 * WeavingPreview: 3Dプレビューのトップレベルコンポーネント
 *
 * React Three Fiber の Canvas、カメラ操作、ライティングを統合する。
 * レスポンシブ対応: 親要素のサイズに追従する。
 */

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { WeavingGraph } from "../lib/wasm-bridge";
import { WeavingScene } from "./WeavingScene";

interface WeavingPreviewProps {
  readonly graph: WeavingGraph | undefined;
  readonly className?: string | undefined;
  readonly completedEdgeIds?: ReadonlySet<number> | undefined;
  readonly currentEdgeId?: number | undefined;
}

function FallbackMessage({ message }: { readonly message: string }) {
  return (
    <output
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a2e",
        color: "#e0e0e0",
        fontFamily: "sans-serif",
      }}
    >
      <p>{message}</p>
    </output>
  );
}

export function WeavingPreview({
  graph,
  className,
  completedEdgeIds,
  currentEdgeId,
}: WeavingPreviewProps) {
  if (!graph) {
    return <FallbackMessage message="パターンを選択してください" />;
  }

  if (graph.nodes.length === 0) {
    return <FallbackMessage message="パターンデータが空です" />;
  }

  // カメラ位置をグラフのサイズに基づいて計算
  // reduce を使い、大量ノード時の Math.max(...spread) によるスタックオーバーフローを防止
  const maxX = graph.nodes.reduce((acc, n) => Math.max(acc, Math.abs(n.x)), 0);
  const maxY = graph.nodes.reduce((acc, n) => Math.max(acc, Math.abs(n.y)), 0);
  const cameraDistance = Math.max(maxX, maxY, 20) * 1.5;

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [
            cameraDistance * 0.5,
            cameraDistance * 0.8,
            cameraDistance,
          ],
          fov: 50,
          near: 0.1,
          far: cameraDistance * 10,
        }}
      >
        {/* ライティング */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />

        {/* カメラ操作 */}
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={1}
          maxDistance={cameraDistance * 5}
        />

        {/* シーン */}
        <WeavingScene
          graph={graph}
          completedEdgeIds={completedEdgeIds}
          currentEdgeId={currentEdgeId}
        />
      </Canvas>
    </div>
  );
}
