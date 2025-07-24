//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type {
	// Nodes (abstract)
	Node,
	Data,
	Literal,
	Parent,
	// Nodes
	Blockquote,
	Break,
	Code,
	Definition,
	Emphasis,
	Heading,
	Html,
	Image,
	ImageReference,
	InlineCode,
	Link,
	LinkReference,
	List,
	ListItem,
	Paragraph,
	Root,
	Strong,
	Text,
	ThematicBreak,
	// Extensions (GFM)
	Delete,
	FootnoteDefinition,
	FootnoteReference,
	Table,
	TableCell,
	TableRow,
	// Extensions (front matter)
	Yaml,
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

export interface MarkdownRuleVisitor
	extends RuleVisitor,
		WithExit<
			{
				root?(node: Root): void;
			} & {
				[NodeType in
					| Blockquote // Nodes
					| Break
					| Code
					| Definition
					| Emphasis
					| Heading
					| Html
					| Image
					| ImageReference
					| InlineCode
					| Link
					| LinkReference
					| List
					| ListItem
					| Paragraph
					| Strong
					| Text
					| ThematicBreak
					| Delete // Extensions (GFM)
					| FootnoteDefinition
					| FootnoteReference
					| Table
					| TableCell
					| TableRow
					| Yaml // Extensions (front matter)
					| Toml
					| Json as NodeType["type"]]?: (
					node: NodeType,
					parent?: Parent,
				) => void;
			}
		> {}

export type MarkdownRuleDefinitionTypeOptions = CustomRuleTypeDefinitions;

export type MarkdownRuleDefinition<
	Options extends Partial<MarkdownRuleDefinitionTypeOptions> = {},
> = CustomRuleDefinitionType<
	{
		LangOptions: MarkdownLanguageOptions;
		Code: MarkdownSourceCode;
		Visitor: MarkdownRuleVisitor;
		Node: Node;
	},
	Options
>;
