/**
 * @fileoverview A simple HTML parser and helper functions for handling HTML nodes in Markdown rules.
 * @author Json Miller, Nate Moore, 루밀LuMir(lumirlumir)
 * @license MIT
 *
 * ---
 *
 * Portions of this code were borrowed from `ultrahtml` - https://github.com/natemoo-re/ultrahtml
 *
 * MIT License Copyright (c) 2022 Nate Moore
 *
 * Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 * The above copyright notice and this permission notice
 * (including the next paragraph) shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * ---
 *
 * Portions of this code were borrowed from `htmlParser` - https://github.com/developit/htmlParser
 *
 * The MIT License (MIT) Copyright (c) 2013 Jason Miller
 *
 * Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// TODO: if (selector.content === "*") return true;
// TODO: getElementByTagName, getElementById, getElementsByClassName, getElementByName

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { HtmlNode, HtmlParentNode, HtmlTextNode, HtmlCommentNode, HtmlDoctypeNode, HtmlDocumentNode } from "./types.js";
 */

//-----------------------------------------------------------------------------
// Helpers: Constants
//-----------------------------------------------------------------------------

/** @type {Set<string>} */
const VOID_TAGS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);
/** @type {Set<string>} */
const RAW_TAGS = new Set(["script", "style"]);

const DOM_PARSER_RE =
	/(?:<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<!--)([\s\S]*?)(-->)|(<!)([\s\S]*?)(>))/gmu;
const ATTR_KEY_IDENTIFIER_RE = /[@.a-z0-9_:-]/iu;

//-----------------------------------------------------------------------------
// Helpers: Functions
//-----------------------------------------------------------------------------

/**
 * TODO
 * @param {HtmlNode} node TODO
 * @returns {boolean} TODO
 */
function canSelfClose(node) {
	if (node.children.length === 0) {
		/** @type {HtmlNode | undefined} */
		let n = node;

		while ((n = n.parent)) {
			if (n.name === "svg") {
				return true;
			}
		}
	}

	return false;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Parses a string of HTML attributes into an object.
 * @param {string} str The string to parse.
 * @returns {Record<string, string>} The parsed attributes as an object.
 * @example
 * ```js
 * import { parseAttrs } from "path/to/html.js";
 *
 * const attrs = parseAttrs('id="my-id" class="my-class" data-custom="value"');
 * console.log(attrs);
 * // { id: "my-id", class: "my-class", data-custom: "value" }
 * ```
 *
 */
export function parseAttrs(str) {
	/** @type {Record<string, string>} */
	const obj = {};

	if (str) {
		/** @type {'none' | 'key' | 'value'} */
		let state = "none";
		/** @type {string | undefined} */
		let currentKey;
		/** @type {string} */
		let currentValue = "";
		/** @type {number | undefined} */
		let tokenStartIndex;
		/** @type {'"' | "'" | undefined} */
		let valueDelimiter;

		for (let currentIndex = 0; currentIndex < str.length; currentIndex++) {
			const currentChar = str[currentIndex];

			if (state === "none") {
				if (ATTR_KEY_IDENTIFIER_RE.test(currentChar)) {
					// add attribute
					if (currentKey) {
						obj[currentKey] = currentValue;
						currentKey = undefined;
						currentValue = "";
					}

					tokenStartIndex = currentIndex;
					state = "key";
				} else if (currentKey && currentChar === "=") {
					state = "value";
				}
			} else if (state === "key") {
				if (!ATTR_KEY_IDENTIFIER_RE.test(currentChar)) {
					currentKey = str.slice(tokenStartIndex, currentIndex);

					if (currentChar === "=") {
						state = "value";
					} else {
						state = "none";
					}
				}
			} else {
				if (
					valueDelimiter &&
					valueDelimiter === currentChar &&
					currentIndex > 0 &&
					str[currentIndex - 1] !== "\\" // if not escaped
				) {
					currentValue = str.slice(tokenStartIndex, currentIndex);
					valueDelimiter = undefined;
					state = "none";
				} else if (
					!valueDelimiter &&
					(currentChar === '"' || currentChar === "'")
				) {
					tokenStartIndex = currentIndex + 1;
					valueDelimiter = currentChar;
				}
			}
		}

		if (
			state === "key" &&
			tokenStartIndex !== undefined &&
			tokenStartIndex < str.length
		) {
			currentKey = str.slice(tokenStartIndex, str.length);
		}

		if (currentKey) {
			obj[currentKey] = currentValue;
		}
	}

	return obj;
}

/**
 * Stringifies an object of HTML attributes into a string.
 * @param {Record<string, string>} attributes The attributes to stringify.
 * @returns {string} The stringified attributes.
 */
export function stringifyAttrs(attributes) {
	let attrStr = "";

	for (const [key, value] of Object.entries(attributes)) {
		attrStr += ` ${key}="${value}"`;
	}

	return attrStr;
}

/**
 * The `parse` function takes a string of HTML and returns an AST (Abstract Syntax Tree).
 * @param {string} input TODO
 * @returns {HtmlNode} TODO
 * @example
 * ```js
 * import { parse } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * console.log(ast);
 * // {
 * //   type: "document",
 * //   children: [
 * //     ...
 * //   ],
 * // }
 * ```
 *
 */
export function parse(input) {
	/** @type {HtmlNode} */
	let doc;
	/** @type {HtmlNode} */
	let parent;
	/** @type {RegExpExecArray | null} */
	let token;
	/** @type {string} */
	let text;
	/** @type {number} */
	let i;
	/** @type {string} */
	let bStart;
	/** @type {string} */
	let bText;
	/** @type {string} */
	let bEnd;
	/** @type {HtmlNode} */
	let tag;
	/** @type {number} */
	let lastIndex = 0;

	/** @type {string} */
	const str = input;
	/** @type {HtmlNode[]} */
	const tags = [];

	/**
	 * TODO
	 * @returns {void}
	 */
	function commitTextNode() {
		// eslint-disable-next-line unicorn/prefer-string-slice, no-restricted-properties -- TODO
		text = str.substring(
			lastIndex,
			DOM_PARSER_RE.lastIndex - token[0].length,
		);

		if (text) {
			parent.children.push(
				/** @type {HtmlTextNode} */ ({
					type: "text",
					value: text,
					parent,
				}),
			);
		}
	}

	DOM_PARSER_RE.lastIndex = 0;

	parent = doc = /** @type {any} */ ({
		type: "document",
		children: [],
	});

	while ((token = DOM_PARSER_RE.exec(str))) {
		bStart = token[5] || token[8];
		bText = token[6] || token[9];
		bEnd = token[7] || token[10];

		if (RAW_TAGS.has(parent.name) && token[2] !== parent.name) {
			// eslint-disable-next-line no-useless-assignment -- TODO
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			if (parent.children.length > 0) {
				parent.children[0].value += token[0];
			}
			continue;
		} else if (bStart === "<!--") {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			if (RAW_TAGS.has(parent.name)) {
				continue;
			}
			tag = /** @type {HtmlCommentNode} */ {
				type: "comment",
				value: bText,
				parent,
				loc: [
					{
						start: i,
						end: i + bStart.length,
					},
					{
						start: DOM_PARSER_RE.lastIndex - bEnd.length,
						end: DOM_PARSER_RE.lastIndex,
					},
				],
			};
			tags.push(tag);
			tag.parent.children.push(tag);
		} else if (bStart === "<!") {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			tag = /** @type {HtmlDoctypeNode} */ {
				type: "doctype",
				value: bText,
				parent,
				loc: [
					{
						start: i,
						end: i + bStart.length,
					},
					{
						start: DOM_PARSER_RE.lastIndex - bEnd.length,
						end: DOM_PARSER_RE.lastIndex,
					},
				],
			};
			tags.push(tag);
			tag.parent.children.push(tag);
		} else if (token[1] !== "/") {
			commitTextNode();
			if (RAW_TAGS.has(parent.name)) {
				lastIndex = DOM_PARSER_RE.lastIndex;
				commitTextNode();
				continue;
			} else {
				tag = {
					type: "element",
					name: `${token[2]}`,
					attributes: parseAttrs(token[3]),
					parent,
					children: [],
					loc: /** @type {any} */ ([
						{
							start: DOM_PARSER_RE.lastIndex - token[0].length,
							end: DOM_PARSER_RE.lastIndex,
						},
					]),
				};
				tags.push(tag);
				tag.parent.children.push(tag);
				if (
					// @ts-expect-error -- TODO
					(token[4] && token[4].includes("/") > -1) ||
					VOID_TAGS.has(tag.name)
				) {
					tag.loc[1] = tag.loc[0];
					tag.isSelfClosingTag = true;
				} else {
					parent = tag;
				}
			}
		} else {
			commitTextNode();
			// Close parent node if end-tag matches
			if (`${token[2]}` === parent.name) {
				tag = parent;
				parent = tag.parent;
				tag.loc.push({
					start: DOM_PARSER_RE.lastIndex - token[0].length,
					end: DOM_PARSER_RE.lastIndex,
				});
				// eslint-disable-next-line unicorn/prefer-string-slice, no-restricted-properties -- TODO
				text = str.substring(tag.loc[0].end, tag.loc[1].start);
				if (tag.children.length === 0) {
					tag.children.push({
						type: "text",
						value: text,
						parent,
					});
				}
			}
			// account for abuse of self-closing tags when an end-tag is also provided:
			else if (
				`${token[2]}` === tags.at(-1).name &&
				tags.at(-1).isSelfClosingTag === true
			) {
				tag = tags.at(-1);
				tag.loc.push({
					start: DOM_PARSER_RE.lastIndex - token[0].length,
					end: DOM_PARSER_RE.lastIndex,
				});
			}
		}

		lastIndex = DOM_PARSER_RE.lastIndex;
	}

	text = str.slice(lastIndex);

	parent.children.push({
		type: "text",
		value: text,
		parent,
	});

	return doc;
}

/**
 * The `walk` function provides full control over the AST.
 * It can be used to scan for text, elements, components,
 * or any other validation you might want to do.
 *
 * `walk` is **synchronous**. This should only be used
 * when it is guaranteed there are no `async` components in the tree.
 * @param {HtmlNode} node TODO
 * @param {(node: HtmlNode, parent?: HtmlNode, index?: number) => void} callback TODO
 * @returns {void}
 * @example
 * ```js
 * import { parse, walk } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * walk(ast, (node) => {
 *   if (node.type === "element" && node.name === "script") {
 *     throw new Error("Found a script!");
 *   }
 * });
 * ```
 *
 */
export function walk(node, callback) {
	/**
	 * TODO
	 * @param {HtmlNode} n TODO
	 * @param {HtmlNode} [parent] TODO
	 * @param {number} [index] TODO
	 * @returns {void}
	 */
	function visit(n, parent, index) {
		// eslint-disable-next-line n/callback-return -- TODO
		callback(n, parent, index);

		if (Array.isArray(n.children)) {
			for (let i = 0; i < n.children.length; i++) {
				const child = n.children[i];
				visit(child, n, i);
			}
		}
	}

	return visit(node);
}

/**
 * The `render` function allows you to serialize an AST back into a string.
 * @param {HtmlNode} node TODO
 * @returns {string} TODO
 * @throws {Error} TODO
 * @example
 * ```js
 * import { parse, render } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * console.log(render(ast)); // <h1>Hello world!</h1>
 * ```
 *
 */
export function render(node) {
	switch (node.type) {
		case "document":
			return node.children
				.map((/** @type {HtmlNode} */ child) => render(child))
				.join("");
		case "element": {
			const { name, attributes = {} } = node;
			const children = node.children
				.map((/** @type {HtmlNode} */ child) => render(child))
				.join("");
			const isSelfClosing = canSelfClose(node);
			if (isSelfClosing || VOID_TAGS.has(name)) {
				return `<${node.name}${stringifyAttrs(attributes)}${
					isSelfClosing ? " /" : ""
				}>`;
			}
			return `<${node.name}${stringifyAttrs(attributes)}>${children}</${node.name}>`;
		}
		case "text":
			return `${node.value}`;
		case "comment":
			return `<!--${node.value}-->`;
		case "doctype":
			return `<!${node.value}>`;
		default:
			throw new Error(`Unknown node type: ${node}`); // TODO
	}
}

/**
 * TODO
 * @param {HtmlNode} node TODO
 * @param {string} selector TODO
 * @returns {HtmlNode[]} TODO
 */ // eslint-disable-next-line no-unused-vars -- TODO
export function querySelectorAll(node, selector) {
	/** @type {HtmlNode[]} */
	const nodes = [];

	walk(node, n => {
		if (n && n.type !== "element") {
			return;
		}
		nodes.push(n);
	});

	return nodes;
}
