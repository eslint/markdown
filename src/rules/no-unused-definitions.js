/**
 * @fileoverview Rule to prevent unused definitions in Markdown.
 * @author 루밀LuMir(lumirlumir)
 */

// @ts-check -- TODO: Remove it later.

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Definition, FootnoteDefinition } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"unusedDefinition" | "unusedFootnoteDefinition"} NoUnusedDefinitionsMessageIds
 * @typedef {[{ allowDefinitions?: string[], allowFootnoteDefinitions?: string[]; }]} NoUnusedDefinitionsOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoUnusedDefinitionsOptions, MessageIds: NoUnusedDefinitionsMessageIds }>} NoUnusedDefinitionsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoUnusedDefinitionsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			recommended: true,
			description: "Disallow unused definitions",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md",
		},

		messages: {
			unusedDefinition:
				"Unexpected unused definition `{{ identifier }}` found.",
			unusedFootnoteDefinition:
				"Unexpected unused footnote definition `{{ identifier }}` found.",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					allowFootnoteDefinitions: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
			},
		],
	},

	create(context) {
		/*
		const allowDefinitions = new Set(context.options[0]?.allowDefinitions);
		const allowFootnoteDefinitions = new Set(
			context.options[0]?.allowFootnoteDefinitions,
		);
		*/

		/** @type {Set<string>} Set to track used identifiers */
		const usedIdentifiers = new Set();
		/** @type {Set<string>} Set to track used footnote identifiers */
		const usedFootnoteIdentifiers = new Set();
		/** @type {Set<Definition>} */
		const definitions = new Set();
		/** @type {Set<FootnoteDefinition>} */
		const footnoteDefinitions = new Set();

		return {
			imageReference(node) {
				usedIdentifiers.add(node.identifier);
			},

			linkReference(node) {
				usedIdentifiers.add(node.identifier);
			},

			footnoteReference(node) {
				usedFootnoteIdentifiers.add(node.identifier);
			},

			definition(node) {
				definitions.add(node);
			},

			footnoteDefinition(node) {
				footnoteDefinitions.add(node);
			},

			"root:exit"() {
				// @ts-ignore -- TODO
				context.report();
			},
		};
	},
};
