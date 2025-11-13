//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type {
	// Nodes (abstract)
	Node,
	Data,
	Literal,
	Parent,
	Parents,
	// Node unions
	Nodes,
	Code,
	Root,
} from "mdast";
import type {
	CustomRuleDefinitionType,
	CustomRuleTypeDefinitions,
	LanguageContext,
	LanguageOptions,
	RuleVisitor,
} from "@eslint/core";
import type { MarkdownSourceCode } from "./index.js";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/** Adds matching `:exit` selectors for all properties of a `RuleVisitor`. */
type WithExit<RuleVisitorType extends RuleVisitor> = {
	[Key in keyof RuleVisitorType as
		| Key
		| `${Key & string}:exit`]: RuleVisitorType[Key];
};

/**
 * Compute the precise parent type for a given node `T`.
 * - Root has no parent (returns `never`).
 * - Custom frontmatter nodes (`toml` / `json`) only appear directly under `Root`.
 * - For nodes, include every parent `P` where `T` is assignable to one of
 *   `P['children'][number]` (i.e. `T` can appear in `P.children`).
 */
type ParentOf<T extends MarkdownNode> = T extends Root
	? never
	: T extends Toml | Json
		? Root
		: Parents extends infer P
			? P extends Parent
				? T extends P["children"][number]
					? P
					: never
				: never
			: never;

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

export interface RangeMap {
	indent: number;
	js: number;
	md: number;
}

export interface BlockBase {
	baseIndentText: string;
	comments: string[];
	rangeMap: RangeMap[];
}

export type Block = Code & BlockBase;

/**
 * Markdown TOML.
 */
export interface Toml extends Literal {
	/**
	 * Node type of mdast TOML.
	 */
	type: "toml";
	/**
	 * Data associated with the mdast TOML.
	 */
	data?: TomlData | undefined;
}

/**
 * Info associated with mdast TOML nodes by the ecosystem.
 */
export interface TomlData extends Data {}

/**
 * Markdown JSON.
 */
export interface Json extends Literal {
	/**
	 * Node type of mdast JSON.
	 */
	type: "json";
	/**
	 * Data associated with the mdast JSON.
	 */
	data?: JsonData | undefined;
}

/**
 * Info associated with mdast JSON nodes by the ecosystem.
 */
export interface JsonData extends Data {}

/**
 * Language options provided for Markdown files.
 */
export interface MarkdownLanguageOptions extends LanguageOptions {
	/**
	 * The options for parsing frontmatter.
	 */
	frontmatter?: false | "yaml" | "toml" | "json";
}

/**
 * The context object that is passed to the Markdown language plugin methods.
 */
export type MarkdownLanguageContext = LanguageContext<MarkdownLanguageOptions>;

export type MarkdownSyntaxElement = Node;

type MarkdownNode = Nodes | Json | Toml;

type MarkdownNodeVisitor = {
	[Node in MarkdownNode as Node["type"]]: Node extends Root
		? ((node: Node) => void) | undefined
		: ((node: Node, parent: ParentOf<Node>) => void) | undefined;
};

export interface MarkdownRuleVisitor
	extends RuleVisitor,
		Partial<WithExit<MarkdownNodeVisitor>> {}

export type MarkdownRuleDefinitionTypeOptions = CustomRuleTypeDefinitions;

export type MarkdownRuleDefinition<
	Options extends Partial<MarkdownRuleDefinitionTypeOptions> = {},
> = CustomRuleDefinitionType<
	{
		LangOptions: MarkdownLanguageOptions;
		Code: MarkdownSourceCode;
		Visitor: MarkdownRuleVisitor;
		Node: MarkdownSyntaxElement;
	},
	Options
>;
