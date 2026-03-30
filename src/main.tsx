import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { WeavingPreview } from "./components/WeavingPreview";
import { generateSampleGozame } from "./lib/sample-patterns";

function App() {
	const graph = useMemo(() => generateSampleGozame(5, 1, 6), []);

	return (
		<StrictMode>
			<div style={{ width: "100vw", height: "100vh", margin: 0 }}>
				<header
					style={{
						padding: "8px 16px",
						backgroundColor: "#1a1a2e",
						color: "#e0e0e0",
						display: "flex",
						alignItems: "center",
						gap: "12px",
					}}
				>
					<h1 style={{ margin: 0, fontSize: "1.2rem" }}>take-waza</h1>
					<span style={{ fontSize: "0.85rem", opacity: 0.7 }}>竹細工パターンデザイナー - ござ目編み 6x6</span>
				</header>
				<div style={{ width: "100%", height: "calc(100vh - 44px)" }}>
					<WeavingPreview graph={graph} />
				</div>
			</div>
		</StrictMode>
	);
}

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(<App />);
}
