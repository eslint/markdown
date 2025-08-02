//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import globals from "globals";
import eslintConfigESLint from "eslint-config-eslint";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import markdown from "./src/index.js";
import { defineConfig } from "eslint/config";
import json from "@eslint/json";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const eslintPluginRulesRecommendedConfig =
	eslintPlugin.configs["flat/rules-recommended"];
const eslintPluginTestsRecommendedConfig =
	eslintPlugin.configs["flat/tests-recommended"];

//-----------------------------------------------------------------------------
// Configuration
//-----------------------------------------------------------------------------

export default defineConfig([
	...eslintConfigESLint.map(config => ({
		files: ["**/*.js"],
		...config,
	})),
	{
		name: "markdown/js",
		files: ["**/*.js"],
		rules: {
			"no-undefined": "off",
		},
	},
	{
		name: "markdown/plugins",
		plugins: {
			markdown,
		},
	},
	{
		name: "markdown/ignores",
		ignores: [
			"**/examples",
			"**/coverage",
			"**/tests/fixtures",
			"dist",
			"src/build/",
		],
	},
	{
		name: "markdown/tools",
		files: ["tools/**/*.js"],
		rules: {
			"no-console": "off",
		},
	},
	{
		name: "markdown/tests",
		files: ["tests/**/*.js"],
		languageOptions: {
			globals: {
				...globals.mocha,
			},
		},
		rules: {
			"no-underscore-dangle": "off",
		},
	},
	{
		name: "markdown/code-blocks",
		files: ["**/*.md"],
		processor: "markdown/markdown",
	},
	{
		name: "markdown/code-blocks/js",
		files: ["**/*.md/*.js"],
		languageOptions: {
			sourceType: "module",
			parserOptions: {
				ecmaFeatures: {
					impliedStrict: true,
				},
			},
		},
		rules: {
			"lines-around-comment": "off",
			"n/no-missing-import": "off",
			"no-var": "off",
			"padding-line-between-statements": "off",
			"no-console": "off",
			"no-alert": "off",
			"@eslint-community/eslint-comments/require-description": "off",
			"jsdoc/require-jsdoc": "off",
		},
	},
	{
		files: ["src/rules/*.js"],
		extends: [eslintPluginRulesRecommendedConfig],
		rules: {
			"eslint-plugin/require-meta-schema": "off", // `schema` defaults to []
			"eslint-plugin/prefer-placeholders": "error",
			"eslint-plugin/prefer-replace-text": "error",
			"eslint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],
			"eslint-plugin/require-meta-docs-description": [
				"error",
				{ pattern: "^(Enforce|Require|Disallow) .+[^. ]$" },
			],
			"eslint-plugin/require-meta-docs-url": [
				"error",
				{
					pattern:
						"https://github.com/eslint/markdown/blob/main/docs/rules/{{name}}.md",
				},
			],
		},
	},
	{
		files: ["tests/rules/*.test.js"],
		extends: [eslintPluginTestsRecommendedConfig],
		rules: {
			"eslint-plugin/test-case-property-ordering": [
				"error",
				[
					"name",
					"filename",
					"code",
					"output",
					"language",
					"options",
					"languageOptions",
					"errors",
				],
			],
			"eslint-plugin/test-case-shorthand-strings": "error",
		},
	},
	{
		plugins: { json },
		files: ["**/*.json", ".c8rc"],
		language: "json/json",
		extends: ["json/recommended"],
	},
]);
