import { defineConfig } from "tsup";
import { getFilesSync } from 'files-folder'

export default defineConfig({
	entry: getFilesSync('src'),
	clean: true,
	sourcemap: false,
	minify: true,
	dts: true,
	format: ["esm", "cjs"],
	legacyOutput: false,
	shims: false,
	outDir: "dist",
	platform: "node",
	target: "node18",
	treeshake: true
});
