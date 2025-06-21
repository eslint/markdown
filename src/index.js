/**
 * @fileoverview Markdown plugin.
 * @author Brandon Mills
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { processor } from "./processor.js";
import { MarkdownLanguage } from "./language/markdown-language.js";
import { MarkdownSourceCode } from "./language/markdown-source-code.js";
import recommendedRules from "./build/recommended-config.js";
import rules from "./build/rules.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Linter } from "eslint";
 * @import { MarkdownRuleVisitor as MRV, MarkdownRuleDefinition as MRD, MarkdownRuleDefinitionTypeOptions } from "./types.js";
 * @typedef {Linter.RulesRecord} RulesRecord
 * @typedef {MarkdownRuleDefinition} RuleModule
 * @typedef {MRV} MarkdownRuleVisitor
 */

/**
 * @typedef {MRD<Options>} MarkdownRuleDefinition<Options>
 * @template {Partial<MarkdownRuleDefinitionTypeOptions>} [Options={}]
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/** @type {RulesRecord} */
const processorRulesConfig = {
	// The Markdown parser automatically trims trailing
	// newlines from code blocks.
	"eol-last": "off",

	// In code snippets and examples, these rules are often
	// counterproductive to clarity and brevity.
	"no-undef": "off",
	"no-unused-expressions": "off",
	"no-unused-vars": "off",
	"padded-blocks": "off",

	// Adding a "use strict" directive at the top of every
	// code block is tedious and distracting. The config
	// opts into strict mode parsing without the directive.
	strict: "off",

	// The processor will not receive a Unicode Byte Order
	// Mark from the Markdown parser.
	"unicode-bom": "off",
};

let recommendedPlugins, processorPlugins;

const plugin = {
	meta: {
		name: "@eslint/markdown",
		version: "6.6.0", // x-release-please-version
	},
	processors: {
		markdown: processor,
	},
	languages: {
		commonmark: new MarkdownLanguage({ mode: "commonmark" }),
		gfm: new MarkdownLanguage({ mode: "gfm" }),
	},
	rules,
	configs: {
		"recommended-legacy": {
			plugins: ["markdown"],
			overrides: [
				{
					files: ["*.md"],
					processor: "markdown/markdown",
				},
				{
					files: ["**/*.md/**"],
					parserOptions: {
						ecmaFeatures: {
							// Adding a "use strict" directive at the top of
							// every code block is tedious and distracting, so
							// opt into strict mode parsing without the
							// directive.
							impliedStrict: true,
						},
					},
					rules: {
						...processorRulesConfig,
					},
				},
			],
		},
		recommended: [
			{
				name: "markdown/recommended",
				files: ["**/*.md"],
				language: "markdown/commonmark",
				plugins: (recommendedPlugins = {}),
				rules: recommendedRules,
			},
		],
		processor: [
			{
				name: "markdown/recommended/plugin",
				plugins: (processorPlugins = {}),
			},
			{
				name: "markdown/recommended/processor",
				files: ["**/*.md"],
				processor: "markdown/markdown",
			},
			{
				name: "markdown/recommended/code-blocks",
				files: ["**/*.md/**"],
				languageOptions: {
					parserOptions: {
						ecmaFeatures: {
							// Adding a "use strict" directive at the top of
							// every code block is tedious and distracting, so
							// opt into strict mode parsing without the
							// directive.
							impliedStrict: true,
						},
					},
				},
				rules: {
					...processorRulesConfig,
				},
			},
		],
	},
};

// @ts-expect-error
recommendedPlugins.markdown = processorPlugins.markdown = plugin;

export default plugin;
export { MarkdownSourceCode };
