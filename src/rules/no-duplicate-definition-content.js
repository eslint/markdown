/**
 * @fileoverview Rule to prevent duplicate definition content in Markdown.
 * @author sethamus
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { normalizeIdentifier } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Definition, FootnoteDefinition, Node } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"duplicateDefinitionUrl" | "duplicateFootnoteDefinitionContent"} NoDuplicateDefinitionContentMessageIds
 * @typedef {[{ allowDefinitions?: string[], allowFootnoteDefinitions?: string[], checkFootnoteDefinitions?: boolean }]} NoDuplicateDefinitionContentOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: NoDuplicateDefinitionContentOptions, MessageIds: NoDuplicateDefinitionContentMessageIds }>} NoDuplicateDefinitionContentRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Serializes a node without its position, replacing its children with their count.
 * @param {Node} node The node to serialize.
 * @returns {string} The serialized node.
 */
function serializeNode(node) {
	return JSON.stringify(node, (key, value) => {
		if (key === "position") {
			return undefined;
		}

		if (key === "children") {
			return value.length;
		}

		return value;
	});
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoDuplicateDefinitionContentRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			recommended: false,
			description: "Disallow duplicate definition content",
			dialects: ["CommonMark", "GFM"],
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-definition-content.md",
		},

		messages: {
			duplicateDefinitionUrl:
				"Unexpected duplicate URL in definition `{{ identifier }}` (label: `{{ label }}`) found. First defined at line {{ firstLine }} in definition `{{ firstIdentifier }}` (label: `{{ firstLabel }}`).",
			duplicateFootnoteDefinitionContent:
				"Unexpected duplicate content in footnote definition `{{ identifier }}` (label: `{{ label }}`) found. First defined at line {{ firstLine }} in footnote definition `{{ firstIdentifier }}` (label: `{{ firstLabel }}`).",
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
					checkFootnoteDefinitions: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowDefinitions: ["//"],
				allowFootnoteDefinitions: [],
				checkFootnoteDefinitions: true,
			},
		],
	},

	create(context) {
		const allowDefinitions = new Set(
			context.options[0].allowDefinitions.map(normalizeIdentifier),
		);
		const allowFootnoteDefinitions = new Set(
			context.options[0].allowFootnoteDefinitions.map(
				normalizeIdentifier,
			),
		);
		const [{ checkFootnoteDefinitions }] = context.options;

		/** @type {Map<string, Definition>} */
		const definitions = new Map();

		/** @type {Map<string, FootnoteDefinition>} */
		const footnoteDefinitions = new Map();

		let footnoteDefinitionChildrenSequence = "";

		/** @type {number[]} */
		const footnoteDefinitionStartIndices = [];

		return {
			definition(node) {
				if (!node.url || allowDefinitions.has(node.identifier)) {
					return;
				}

				const firstDefinitionNode = definitions.get(node.url);

				if (!firstDefinitionNode) {
					definitions.set(node.url, node);
				} else if (firstDefinitionNode.identifier !== node.identifier) {
					context.report({
						node,
						messageId: "duplicateDefinitionUrl",
						data: {
							identifier: node.identifier,
							label: node.label.trim(),
							firstLine: firstDefinitionNode.position.start.line,
							firstIdentifier: firstDefinitionNode.identifier,
							firstLabel: firstDefinitionNode.label.trim(),
						},
					});
				}
			},

			footnoteDefinition(node) {
				if (footnoteDefinitionStartIndices.length === 0) {
					footnoteDefinitionChildrenSequence = "";
				} else {
					footnoteDefinitionChildrenSequence += serializeNode(node);
				}

				footnoteDefinitionStartIndices.push(
					footnoteDefinitionChildrenSequence.length,
				);
			},

			"footnoteDefinition :not(footnoteDefinition)"(node) {
				footnoteDefinitionChildrenSequence += serializeNode(node);
			},

			"footnoteDefinition:exit"(node) {
				const content = footnoteDefinitionChildrenSequence.slice(
					footnoteDefinitionStartIndices.pop(),
				);

				if (
					!checkFootnoteDefinitions ||
					!content ||
					allowFootnoteDefinitions.has(node.identifier)
				) {
					return;
				}

				const firstFootnoteDefinitionNode =
					footnoteDefinitions.get(content);

				if (!firstFootnoteDefinitionNode) {
					footnoteDefinitions.set(content, node);
				} else if (
					firstFootnoteDefinitionNode.identifier !== node.identifier
				) {
					context.report({
						node,
						messageId: "duplicateFootnoteDefinitionContent",
						data: {
							identifier: node.identifier,
							label: node.label,
							firstLine:
								firstFootnoteDefinitionNode.position.start.line,
							firstIdentifier:
								firstFootnoteDefinitionNode.identifier,
							firstLabel: firstFootnoteDefinitionNode.label,
						},
					});
				}
			},
		};
	},
});
