import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { ParameterPanel } from "./components/ParameterPanel";
import { StepNavigator } from "./components/StepNavigator";
import { WeavingPreview } from "./components/WeavingPreview";
import { useDebounce } from "./hooks/useDebounce";
import { usePatternParams } from "./hooks/usePatternParams";
import { useStepNavigation } from "./hooks/useStepNavigation";
import { generateSamplePattern } from "./lib/sample-patterns";

function App() {
	const { params, setPattern, setWidth, setThickness, setCount } = usePatternParams();
	const debouncedParams = useDebounce(params, 200);
	const graph = useMemo(
		() =>
			generateSamplePattern(
				debouncedParams.pattern,
				debouncedParams.width,
				debouncedParams.thickness,
				debouncedParams.count,
			),
		[debouncedParams],
	);

	const navigation = useStepNavigation(graph);

	return (
		<StrictMode>
			<div
				style={{
					width: "100vw",
					height: "100vh",
					margin: 0,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<header
					style={{
						padding: "8px 16px",
						backgroundColor: "#1a1a2e",
						color: "#e0e0e0",
						display: "flex",
						alignItems: "center",
						gap: "12px",
						flexShrink: 0,
					}}
				>
					<h1 style={{ margin: 0, fontSize: "1.2rem" }}>take-waza</h1>
					<span style={{ fontSize: "0.85rem", opacity: 0.7 }}>竹細工パターンデザイナー</span>
				</header>
				<div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
					<ParameterPanel
						params={params}
						onPatternChange={setPattern}
						onWidthChange={setWidth}
						onThicknessChange={setThickness}
						onCountChange={setCount}
					/>
					<div
						style={{
							flex: 1,
							minWidth: 0,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div style={{ flex: 1, minHeight: 0 }}>
							<WeavingPreview
								graph={graph}
								completedEdgeIds={navigation.completedEdgeIds}
								currentEdgeId={navigation.currentEdgeId}
							/>
						</div>
						<StepNavigator navigation={navigation} />
					</div>
				</div>
			</div>
		</StrictMode>
	);
}

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(<App />);
}
