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
	| typeof DOCUMENT_NODE
	| typeof ELEMENT_NODE
	| typeof TEXT_NODE
	| typeof COMMENT_NODE
	| typeof DOCTYPE_NODE;

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
	type: typeof DOCUMENT_NODE;
	attributes: Record<string, string>;
	parent: undefined;
}

export interface ElementNode extends ParentNode {
	type: typeof ELEMENT_NODE;
	name: string;
	attributes: Record<string, string>;
}

export interface TextNode extends LiteralNode {
	type: typeof TEXT_NODE;
}

export interface CommentNode extends LiteralNode {
	type: typeof COMMENT_NODE;
}

export interface DoctypeNode extends LiteralNode {
	type: typeof DOCTYPE_NODE;
}

interface VisitorSync {
	(node: Node, parent?: Node, index?: number): void;
}

//-----------------------------------------------------------------------------
// Helpers: Constants
//-----------------------------------------------------------------------------

export const DOCUMENT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const COMMENT_NODE = 3;
export const DOCTYPE_NODE = 4;

const Fragment = Symbol("Fragment");
const HTMLString = Symbol("HTMLString");
const AttrString = Symbol("AttrString");
const RenderFn = Symbol("RenderFn");

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
const ESCAPE_CHARS: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
};

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

function escapeHTML(str: string): string {
	return str.replace(/[&<>]/g, c => ESCAPE_CHARS[c] || c);
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

function renderElementSync(node: Node): string {
	const { name, attributes = {} } = node;
	const children = node.children
		.map((child: Node) => renderSync(child))
		.join("");
	if (RenderFn in node) {
		const value = (node as any)[RenderFn](attributes, mark(children));
		if (value && (value as any)[HTMLString]) return value.value;
		return escapeHTML(String(value));
	}
	if (name === Fragment) return children;
	const isSelfClosing = canSelfClose(node);
	if (isSelfClosing || VOID_TAGS.has(name)) {
		return `<${node.name}${attrs(attributes).value}${
			isSelfClosing ? " /" : ""
		}>`;
	}
	return `<${node.name}${attrs(attributes).value}>${children}</${node.name}>`;
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

function select(
	node: Node,
	opts: { single?: boolean } = { single: false },
): Node[] {
	let nodes: Node[] = [];
	walkSync(node, (n): void => {
		if (n && n.type !== ELEMENT_NODE) return;
		if (opts.single) throw n;
		nodes.push(n);
	});
	return nodes;
}

//-----------------------------------------------------------------------------
// Helpers: Classes
//-----------------------------------------------------------------------------

class WalkerSync {
	constructor(private callback: VisitorSync) {}
	visit(node: Node, parent?: Node, index?: number): void {
		this.callback(node, parent, index);
		if (Array.isArray(node.children)) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				this.visit(child, node, i);
			}
		}
	}
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export function parse(input: string): any {
	let str = input;
	let doc: Node,
		parent: Node,
		token: any,
		text,
		i,
		bStart,
		bText,
		bEnd,
		tag: Node;
	const tags: Node[] = [];
	DOM_PARSER_RE.lastIndex = 0;
	parent = doc = {
		type: DOCUMENT_NODE,
		children: [] as Node[],
	} as any;

	let lastIndex = 0;
	function commitTextNode() {
		text = str.substring(
			lastIndex,
			DOM_PARSER_RE.lastIndex - token[0].length,
		);
		if (text) {
			(parent as ParentNode).children.push({
				type: TEXT_NODE,
				value: text,
				parent,
			} as any);
		}
	}

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
			tag = {
				type: COMMENT_NODE,
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
			} as any;
			tags.push(tag);
			(tag.parent as any).children.push(tag);
		} else if (bStart === "<!") {
			i = DOM_PARSER_RE.lastIndex - token[0].length;
			tag = {
				type: DOCTYPE_NODE,
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
					type: ELEMENT_NODE,
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
						type: TEXT_NODE,
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
		type: TEXT_NODE,
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
 * import { parse, walkSync, ELEMENT_NODE } from "path/to/html.js";
 *
 * const ast = parse(`<h1>Hello world!</h1>`);
 * walkSync(ast, (node) => {
 *   if (node.type === ELEMENT_NODE && node.name === "script") {
 *     throw new Error("Found a script!");
 *   }
 * });
 * ```
 */
export function walkSync(node: Node, callback: VisitorSync): void {
	const walker = new WalkerSync(callback);
	return walker.visit(node);
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
		case DOCUMENT_NODE:
			return node.children
				.map((child: Node) => renderSync(child))
				.join("");
		case ELEMENT_NODE:
			return renderElementSync(node);
		case TEXT_NODE:
			return `${node.value}`;
		case COMMENT_NODE:
			return `<!--${node.value}-->`;
		case DOCTYPE_NODE:
			return `<!${node.value}>`;
	}
}

export function querySelector(node: Node, selector: string): Node {
	try {
		return select(node, { single: true })[0];
	} catch (e) {
		if (e instanceof Error) {
			throw e;
		}
		return e as Node;
	}
}

export function querySelectorAll(node: Node, selector: string): Node[] {
	return select(node);
}
