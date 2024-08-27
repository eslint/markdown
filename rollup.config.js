import copy from "rollup-plugin-copy";

export default {
	input: "src/index.js",
	output: [
		{
			file: "dist/esm/index.js",
			format: "esm",
			banner: '// @ts-self-types="./index.d.ts"',
		},
	],
	plugins: [
		copy({
			targets: [{ src: "src/types.ts", dest: "dist/esm" }],
		}),
	],
};
