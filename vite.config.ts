import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				content: resolve(__dirname, "src/content/index.ts"),
				background: resolve(__dirname, "src/background.ts"),
				sidepanel: resolve(__dirname, "src/sidepanel.ts"),
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
		outDir: "dist",
		emptyOutDir: true,
	},
});
