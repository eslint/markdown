import type { Node } from "./index.js";
import { ELEMENT_NODE, walkSync } from "./index.js";
import type { AST } from "parsel-js";
import { parse } from "parsel-js";

export function querySelector(node: Node, selector: string): Node {
	const match = selectorToMatch(selector);
	try {
		return select(
			node,
			(n: Node, parent?: Node, index?: number) => {
				let m = match(n, parent, index);
				if (!m) return false;
				return m;
			},
			{ single: true },
		)[0];
	} catch (e) {
		if (e instanceof Error) {
			throw e;
		}
		return e as Node;
	}
}

export function querySelectorAll(node: Node, selector: string): Node[] {
	const match = selectorToMatch(selector);
	return select(node, (n: Node, parent?: Node, index?: number) => {
		let m = match(n, parent, index);
		if (!m) return false;
		return m;
	});
}

interface Matcher {
	(n: Node, parent?: Node, index?: number): boolean;
}

function select(
	node: Node,
	match: Matcher,
	opts: { single?: boolean } = { single: false },
): Node[] {
	let nodes: Node[] = [];
	walkSync(node, (n, parent, index): void => {
		if (n && n.type !== ELEMENT_NODE) return;
		if (match(n, parent, index)) {
			if (opts.single) throw n;
			nodes.push(n);
		}
	});
	return nodes;
}

const createMatch = (selector: AST): Matcher => {
	switch (selector.type) {
		case "type":
			return (node: Node) => {
				if (selector.content === "*") return true;
				return node.name === selector.name;
			};
		default: {
			throw new Error(`Unhandled selector: ${selector.type}`);
		}
	}
};

const selectorToMatch = (sel: string | AST): Matcher => {
	let selector = typeof sel === "string" ? parse(sel) : sel;
	switch (selector?.type) {
		default:
			return createMatch(selector!) as Matcher;
	}
};
