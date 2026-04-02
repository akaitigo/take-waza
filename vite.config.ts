import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [wasm(), react()],
	resolve: {
		alias: {
			"@": "/src",
		},
	},
	build: {
		target: "ES2023",
		rollupOptions: {
			output: {
				// Ensure WASM files are output with content hashes
				assetFileNames: "assets/[name]-[hash][extname]",
			},
		},
	},
	assetsInclude: ["**/*.wasm"],
	optimizeDeps: {
		exclude: ["wasm-engine"],
	},
});
