/**
 * @fileoverview Rule to require alternative text for images in Markdown.
 * @author Pixel998
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { stripHtmlComments } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { Image, ImageReference } from "mdast";
 * @import { MarkdownRuleDefinition } from "../types.js";
 * @typedef {"altTextRequired"} RequireAltTextMessageIds
 * @typedef {[]} RequireAltTextOptions
 * @typedef {MarkdownRuleDefinition<{ RuleOptions: RequireAltTextOptions, MessageIds: RequireAltTextMessageIds }>} RequireAltTextRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const imgTagPattern = /<img(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?\/?>/giu;
const ariaHiddenTruePattern =
	/[\s"']aria-hidden\s*=\s*(?:"true"|'true'|true(?=\s|\/?>))/iu;

const attributePattern =
	/(?<name>[^\s"'<>/=]+)(?:\s*=\s*(?:"(?<doubleQuoted>[^"]*)"|'(?<singleQuoted>[^']*)'|(?<unquoted>[^\s"'=<>`]+)))?/gu;

/**
 * Gets the value of an HTML attribute from an `<img>` tag.
 * @param {string} tag The `<img>` tag to search.
 * @param {string} name The lowercase attribute name to look for.
 * @returns {string | undefined} The attribute value (an empty string if the
 * attribute has no value), or `undefined` if the attribute is not present.
 */
function getHtmlAttribute(tag, name) {
	for (const match of tag.slice("<img".length).matchAll(attributePattern)) {
		const { doubleQuoted, singleQuoted, unquoted } = match.groups;

		if (match.groups.name.toLowerCase() === name) {
			return doubleQuoted ?? singleQuoted ?? unquoted ?? "";
		}
	}

	return undefined;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {RequireAltTextRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["markdown/commonmark", "markdown/gfm"],

		docs: {
			recommended: true,
			description: "Require alternative text for images",
			dialects: ["CommonMark", "GFM"],
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/require-alt-text.md",
		},

		messages: {
			altTextRequired: "Alternative text for image is required.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			"image, imageReference"(
				/** @type {Image | ImageReference} */ node,
			) {
				if (node.alt.trim().length === 0) {
					context.report({
						loc: node.position,
						messageId: "altTextRequired",
					});
				}
			},

			html(node) {
				const text = stripHtmlComments(sourceCode.getText(node));

				/** @type {RegExpExecArray | null} */
				let match;

				while ((match = imgTagPattern.exec(text)) !== null) {
					const imgTag = match[0];

					if (ariaHiddenTruePattern.test(imgTag)) {
						continue;
					}

					const alt = getHtmlAttribute(imgTag, "alt");
					if (
						alt === undefined ||
						(alt.length > 0 && alt.trim().length === 0)
					) {
						const startOffset = // Adjust `imgTagPattern` match indices to the full source code.
							match.index + node.position.start.offset;
						const endOffset = startOffset + imgTag.length;

						context.report({
							loc: {
								start: sourceCode.getLocFromIndex(startOffset),
								end: sourceCode.getLocFromIndex(endOffset),
							},
							messageId: "altTextRequired",
						});
					}
				}
			},
		};
	},
});
