/**
 * @fileoverview Rule to prevent bare URLs in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Paragraph} ParagraphNode */
/** @typedef {import("mdast").TableCell} TableCellNode */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoBareUrlsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlTagPattern = /^<([^!>][^/\s>]*)/u;

/**
 * Parses an HTML tag to extract its name and closing status
 * @param {string} tagText The HTML tag text to parse
 * @returns {{ name: string; isClosing: boolean; } | null} Object containing tag name and closing status, or null if not a valid tag
 */
function parseHtmlTag(tagText) {
	const match = tagText.match(htmlTagPattern);
	if (match) {
		const tagName = match[1].toLowerCase();
		const isClosing = tagName.startsWith("/");

		return {
			name: isClosing ? tagName.slice(1) : tagName,
			isClosing,
		};
	}

	return null;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoBareUrlsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow bare URLs",
			url: "https://github.com/eslint/markdown/blob/main/docs/rules/no-bare-urls.md",
		},

		fixable: "code",

		messages: {
			bareUrl:
				"Unexpected bare URL. Use autolink (<URL>) or link ([text](URL)) instead.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		const bareUrls = [];

		/**
		 * Finds bare URLs in markdown nodes while handling HTML tags.
		 * When an HTML tag is found, it looks for its closing tag and skips all nodes
		 * between them to prevent checking for bare URLs inside HTML content.
		 * @param {ParagraphNode|TableCellNode} node The node to process
		 * @returns {void}
		 */
		function findBareUrls(node) {
			if (!node.children) {
				return;
			}

			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];

				if (child.type === "html") {
					const tagInfo = parseHtmlTag(sourceCode.getText(child));

					if (tagInfo && !tagInfo.isClosing) {
						for (let j = i + 1; j < node.children.length; j++) {
							const nextChild = node.children[j];
							if (nextChild.type === "html") {
								const closingTagInfo = parseHtmlTag(
									sourceCode.getText(nextChild),
								);
								if (
									closingTagInfo?.name === tagInfo.name &&
									closingTagInfo?.isClosing
								) {
									i = j;
									break;
								}
							}
						}
					}
				} else if (child.type === "link") {
					const text = sourceCode.getText(child);
					const { url } = child;

					if (
						text === url ||
						url === `http://${text}` ||
						url === `mailto:${text}`
					) {
						bareUrls.push(child);
					}
				}
			}
		}

		return {
			"root:exit"() {
				for (const bareUrl of bareUrls) {
					context.report({
						node: bareUrl,
						messageId: "bareUrl",
						fix(fixer) {
							const text = sourceCode.getText(bareUrl);
							return fixer.replaceText(bareUrl, `<${text}>`);
						},
					});
				}
			},

			paragraph(node) {
				findBareUrls(node);
			},

			tableCell(node) {
				findBareUrls(node);
			},
		};
	},
};
