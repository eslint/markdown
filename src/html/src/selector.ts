import type { Node } from "./index.js";
import { ELEMENT_NODE, walkSync } from "./index.js";

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

// TODO: if (selector.content === "*") return true;
