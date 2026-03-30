import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

function App() {
	return (
		<StrictMode>
			<div>
				<h1>take-waza</h1>
				<p>竹細工の編み方パターンをノードグラフでモデル化し、3Dプレビューで設計するCADツール</p>
			</div>
		</StrictMode>
	);
}

const root = document.getElementById("root");
if (root) {
	createRoot(root).render(<App />);
}
