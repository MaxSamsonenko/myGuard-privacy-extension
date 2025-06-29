import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	base: "./",
	plugins: [react()],
	build: {
		outDir: "extension",
		emptyOutDir: false,
		rollupOptions: {
			input: {
				popup: resolve(__dirname, "index.html"),
			},
		},
	},
});
