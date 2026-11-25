import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import markdown from "../../src/index.js";
import globals from "globals";
import reactPlugin from "@eslint-react/eslint-plugin";

export default defineConfig([
	js.configs.recommended,
	markdown.configs.processor,
	reactPlugin.configs.recommended,
	{
		settings: {
			"react-x": {
				version: "19.3.0",
			},
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			ecmaVersion: 2015,
			sourceType: "module",
			globals: globals.browser,
		},
	},
	{
		files: ["**/*.md/*.jsx"],
		languageOptions: {
			globals: {
				React: false,
			},
		},
	},
]);
