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

export type Node =
	| DocumentNode
	| ElementNode
	| TextNode
	| CommentNode
	| DoctypeNode;

export type NodeType =
	| DocumentNode["type"]
	| ElementNode["type"]
	| TextNode["type"]
	| CommentNode["type"]
	| DoctypeNode["type"];

export interface Location {
	start: number;
	end: number;
}

interface BaseNode {
	type: NodeType;
	loc: [Location, Location];
	parent: Node;
	[key: string]: any;
}

interface LiteralNode extends BaseNode {
	value: string;
}

interface ParentNode extends BaseNode {
	children: Node[];
}

export interface DocumentNode extends Omit<ParentNode, "parent"> {
	type: "document";
	attributes: Record<string, string>;
	parent: undefined;
}

export interface ElementNode extends ParentNode {
	type: "element";
	name: string;
	attributes: Record<string, string>;
}

export interface TextNode extends LiteralNode {
	type: "text";
}

export interface CommentNode extends LiteralNode {
	type: "comment";
}

export interface DoctypeNode extends LiteralNode {
	type: "doctype";
}

//-----------------------------------------------------------------------------
// Helpers: Constants
//-----------------------------------------------------------------------------

const HTMLString = Symbol("HTMLString");
const AttrString = Symbol("AttrString");

const VOID_TAGS = new Set<string>([
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
const RAW_TAGS = new Set<string>(["script", "style"]);

const DOM_PARSER_RE =
	/(?:<(\/?)([a-zA-Z][a-zA-Z0-9\:-]*)(?:\s([^>]*?))?((?:\s*\/)?)>|(<\!\-\-)([\s\S]*?)(\-\->)|(<\!)([\s\S]*?)(>))/gm;
const ATTR_KEY_IDENTIFIER_RE = /[\@\.a-z0-9_\:\-]/i;

//-----------------------------------------------------------------------------
// Helpers: Functions
//-----------------------------------------------------------------------------

function attrs(attributes: Record<string, string>) {
	let attrStr = "";
	for (const [key, value] of Object.entries(attributes)) {
		attrStr += ` ${key}="${value}"`;
	}
	return mark(attrStr, [HTMLString, AttrString]);
}

function canSelfClose(node: Node): boolean {
	if (node.children.length === 0) {
		let n: Node | undefined = node;
		while ((n = n.parent)) {
			if (n.name === "svg") return true;
		}
	}
	return false;
}

function mark(str: string, tags: symbol[] = [HTMLString]): { value: string } {
	const v = { value: str };
	for (const tag of tags) {
		Object.defineProperty(v, tag, {
			value: true,
			enumerable: false,
			writable: false,
		});
	}
	return v;
}

function splitAttrs(str?: string) {
	let obj: Record<string, string> = {};
	if (str) {
		let state: "none" | "key" | "value" = "none";
		let currentKey: string | undefined;
		let currentValue: string = "";
		let tokenStartIndex: number | undefined;
		let valueDelimiter: '"' | "'" | undefined;
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
				} else if (currentChar === "=" && currentKey) {
					state = "value";
				}
			} else if (state === "key") {
				if (!ATTR_KEY_IDENTIFIER_RE.test(currentChar)) {
					currentKey = str.substring(tokenStartIndex!, currentIndex);
					if (currentChar === "=") {
						state = "value";
					} else {
						state = "none";
					}
				}
			} else {
				if (
					currentChar === valueDelimiter &&
					currentIndex > 0 &&
					str[currentIndex - 1] !== "\\"
				) {
					if (valueDelimiter) {
						currentValue = str.substring(
							tokenStartIndex!,
							currentIndex,
						);
						valueDelimiter = undefined;
						state = "none";
					}
				} else if (
					(currentChar === '"' || currentChar === "'") &&
					!valueDelimiter
				) {
					tokenStartIndex = currentIndex + 1;
					valueDelimiter = currentChar;
				}
			}
		}
		if (
			state === "key" &&
			tokenStartIndex != undefined &&
			tokenStartIndex < str.length
		) {
			currentKey = str.substring(tokenStartIndex, str.length);
		}
		if (currentKey) {
			obj[currentKey] = currentValue;
		}
	}
	return obj;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * The `parse` function takes a string of HTML and returns an AST (Abstract Syntax Tree).
 *
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
 */
export function parse(input: string): any {
	let str = input;
	let doc: Node,
		parent: Node,
		token: RegExpExecArray | null,
		text: string,
		i: number,
		bStart: string,
		bText: string,
		bEnd: string,
		tag: Node;
	let lastIndex = 0;
	const tags: Node[] = [];

	function commitTextNode() {
		text = str.substring(
			lastIndex,
			DOM_PARSER_RE.lastIndex - token[0].length,
		);
		if (text) {
			(parent as ParentNode).children.push({
				type: "text",
				value: text,
				parent,
			} as any);
		}
	}

	DOM_PARSER_RE.lastIndex = 0;

	parent = doc = {
		type: "document",
		children: [] as Node[],
	} as any;

	while ((token = DOM_PARSER_RE.exec(str))) {
		bStart = token[5] || token[8];
		bText = token[6] || token[9];
		bEnd = token[7] || token[10];
		if (RAW_TAGS.has(parent.name) && token[2] !== parent.name) {
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
			tag = /** @type {CommentNode} */ {
				type: "comment",
				value: bText,
				parent: parent,
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
			tag = /** @type {DoctypeNode} */ {
				type: "doctype",
				value: bText,
				parent: parent,
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
			// commitTextNode();
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
					name: token[2] + "",
					attributes: splitAttrs(token[3]),
					parent,
					children: [],
					loc: [
						{
							start: DOM_PARSER_RE.lastIndex - token[0].length,
							end: DOM_PARSER_RE.lastIndex,
						},
					] as any,
				};
				tags.push(tag);
				tag.parent.children.push(tag);
				if (
					(token[4] && token[4].indexOf("/") > -1) ||
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
			if (token[2] + "" === parent.name) {
				tag = parent;
				parent = tag.parent!;
				tag.loc.push({
					start: DOM_PARSER_RE.lastIndex - token[0].length,
					end: DOM_PARSER_RE.lastIndex,
				});
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
				token[2] + "" === tags[tags.length - 1].name &&
				tags[tags.length - 1].isSelfClosingTag === true
			) {
				tag = tags[tags.length - 1];
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
 * The `walkSync` function provides full control over the AST.
 * It can be used to scan for text, elements, components,
 * or any other validation you might want to do.
 *
 * `walkSync` is **synchronous**. This should only be used
 * when it is guaranteed there are no `async` components in the tree.
 *
 * @example
 * ```js
 * import { parse, walkSync } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * walkSync(ast, (node) => {
 *   if (node.type === "element" && node.name === "script") {
 *     throw new Error("Found a script!");
 *   }
 * });
 * ```
 */
export function walkSync(
	node: Node,
	callback: (node: Node, parent?: Node, index?: number) => void,
): void {
	function visit(node: Node, parent?: Node, index?: number): void {
		callback(node, parent, index);
		if (Array.isArray(node.children)) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				visit(child, node, i);
			}
		}
	}

	return visit(node);
}

/**
 * The `renderSync` function allows you to serialize an AST back into a string.
 *
 * - **Note**: By default, `renderSync` will sanitize your markup,
 *   removing any `script` tags. Pass `{ sanitize: false }` to disable this behavior.
 *
 * @example
 *
 * ```js
 * import { parse, renderSync } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * console.log(renderSync(ast)); // <h1>Hello world!</h1>
 * ```
 */
export function renderSync(node: Node): string {
	switch (node.type) {
		case "document":
			return node.children
				.map((child: Node) => renderSync(child))
				.join("");
		case "element": {
			const { name, attributes = {} } = node;
			const children = node.children
				.map((child: Node) => renderSync(child))
				.join("");
			const isSelfClosing = canSelfClose(node);
			if (isSelfClosing || VOID_TAGS.has(name)) {
				return `<${node.name}${attrs(attributes).value}${
					isSelfClosing ? " /" : ""
				}>`;
			}
			return `<${node.name}${attrs(attributes).value}>${children}</${node.name}>`;
		}
		case "text":
			return `${node.value}`;
		case "comment":
			return `<!--${node.value}-->`;
		case "doctype":
			return `<!${node.value}>`;
	}
}

export function querySelectorAll(node: Node, selector: string): Node[] {
	let nodes: Node[] = [];
	walkSync(node, (n): void => {
		if (n && n.type !== "element") return;
		nodes.push(n);
	});
	return nodes;
}
