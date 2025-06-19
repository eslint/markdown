/**
 * @fileoverview Rule to prevent bare URLs in Markdown.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Node} Node */
/** @typedef {import("mdast").Paragraph} ParagraphNode */
/** @typedef {import("mdast").Heading} HeadingNode */
/** @typedef {import("mdast").TableCell} TableCellNode */
/** @typedef {import("mdast").Link} LinkNode */
/**
 * @typedef {import("../types.ts").MarkdownRuleDefinition<{ RuleOptions: []; }>}
 * NoBareUrlsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const htmlTagNamePattern = /^<([^!>][^/\s>]*)/u;

/**
 * Parses an HTML tag to extract its name and closing status
 * @param {string} tagText The HTML tag text to parse
 * @returns {{ name: string; isClosing: boolean; } | null} Object containing tag name and closing status, or null if not a valid tag
 */
function parseHtmlTag(tagText) {
	const match = tagText.match(htmlTagNamePattern);
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
		/** @type {Array<LinkNode>} */
		const bareUrls = [];

		/**
		 * Finds bare URLs in markdown nodes while handling HTML tags.
		 * When an HTML tag is found, it looks for its closing tag and skips all nodes
		 * between them to prevent checking for bare URLs inside HTML content.
		 * @param {ParagraphNode|HeadingNode|TableCellNode} node The node to process
		 * @returns {void}
		 */
		function findBareUrls(node) {
			/**
			 * Recursively traverses the AST to find bare URLs, skipping over HTML blocks.
			 * @param {Node} currentNode The current AST node being traversed.
			 * @returns {void}
			 */
			function traverse(currentNode) {
				if (
					"children" in currentNode &&
					Array.isArray(currentNode.children)
				) {
					for (let i = 0; i < currentNode.children.length; i++) {
						const child = currentNode.children[i];

						if (child.type === "html") {
							const tagInfo = parseHtmlTag(
								sourceCode.getText(child),
							);

							if (tagInfo && !tagInfo.isClosing) {
								for (
									let j = i + 1;
									j < currentNode.children.length;
									j++
								) {
									const nextChild = currentNode.children[j];
									if (nextChild.type === "html") {
										const closingTagInfo = parseHtmlTag(
											sourceCode.getText(nextChild),
										);
										if (
											closingTagInfo?.name ===
												tagInfo.name &&
											closingTagInfo?.isClosing
										) {
											i = j;
											break;
										}
									}
								}
								continue;
							}
						}

						if (child.type === "link") {
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

						traverse(child);
					}
				}
			}

			traverse(node);
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

			heading(node) {
				findBareUrls(node);
			},

			tableCell(node) {
				findBareUrls(node);
			},
		};
	},
};
