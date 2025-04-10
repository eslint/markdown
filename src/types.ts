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
import type { Linter } from "eslint";
import type {
	LanguageOptions,
	LanguageContext,
	RuleDefinition,
	RuleVisitor,
	SourceLocation,
	TextSourceCode,
} from "@eslint/core";

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

export interface Block extends Node, BlockBase {
	meta: string | null;
}

export type Message = Linter.LintMessage;

export type RuleType = "problem" | "suggestion" | "layout";

/**
 * Markdown TOML.
 */
export interface Toml extends Literal {
	/**
	 * Node type of mdast TOML.
	 */
	type: "toml";
	/**
	 * Data associated with the mdast YAML.
	 */
	data?: TomlData | undefined;
}

/**
 * Info associated with mdast TOML nodes by the ecosystem.
 */
export interface TomlData extends Data {}

/**
 * Language options provided for Markdown files.
 */
export interface MarkdownLanguageOptions extends LanguageOptions {
	/**
	 * The options for parsing frontmatter.
	 */
	frontmatter?: false | "yaml" | "toml";
}

/**
 * The context object that is passed to the Markdown language plugin methods.
 */
export type MarkdownLanguageContext = LanguageContext<MarkdownLanguageOptions>;

/**
 * The `SourceCode` interface for Markdown files.
 */
export interface IMarkdownSourceCode
	extends TextSourceCode<{
		LangOptions: MarkdownLanguageOptions;
		RootNode: Root;
		SyntaxElementWithLoc: Node;
		ConfigNode: { value: string; position: SourceLocation };
	}> {
	/**
	 * Gets the entire source text split into an array of lines.
	 * @returns The source text as an array of lines.
	 */
	get lines(): Array<string>;

	/**
	 * Gets the source code for the given node.
	 * @param node The AST node to get the text for.
	 * @param beforeCount The number of characters before the node to retrieve.
	 * @param afterCount The number of characters after the node to retrieve.
	 * @returns The text representing the AST node.
	 */
	getText(node?: Node, beforeCount?: number, afterCount?: number): string;
}

export interface MarkdownRuleVisitor
	extends RuleVisitor,
		WithExit<{
			// Nodes
			blockquote?(node: Blockquote, parent?: Parent): void;
			break?(node: Break, parent?: Parent): void;
			code?(node: Code, parent?: Parent): void;
			definition?(node: Definition, parent?: Parent): void;
			emphasis?(node: Emphasis, parent?: Parent): void;
			heading?(node: Heading, parent?: Parent): void;
			html?(node: Html, parent?: Parent): void;
			image?(node: Image, parent?: Parent): void;
			imageReference?(node: ImageReference, parent?: Parent): void;
			inlineCode?(node: InlineCode, parent?: Parent): void;
			link?(node: Link, parent?: Parent): void;
			linkReference?(node: LinkReference, parent?: Parent): void;
			list?(node: List, parent?: Parent): void;
			listItem?(node: ListItem, parent?: Parent): void;
			paragraph?(node: Paragraph, parent?: Parent): void;
			root?(node: Root): void;
			strong?(node: Strong, parent?: Parent): void;
			text?(node: Text, parent?: Parent): void;
			thematicBreak?(node: ThematicBreak, parent?: Parent): void;
			// Extensions (GFM)
			delete?(node: Delete, parent?: Parent): void;
			footnoteDefinition?(
				node: FootnoteDefinition,
				parent?: Parent,
			): void;
			footnoteReference?(node: FootnoteReference, parent?: Parent): void;
			table?(node: Table, parent?: Parent): void;
			tableCell?(node: TableCell, parent?: Parent): void;
			tableRow?(node: TableRow, parent?: Parent): void;
			// Extensions (front matter)
			yaml?(node: Yaml, parent?: Parent): void;
			toml?(node: Toml, parent?: Parent): void;
		}> {}

export type MarkdownRuleDefinitionTypeOptions = {
	RuleOptions: unknown[];
	MessageIds: string;
	ExtRuleDocs: Record<string, unknown>;
};

export type MarkdownRuleDefinition<
	Options extends Partial<MarkdownRuleDefinitionTypeOptions> = {},
> = RuleDefinition<
	// Language specific type options (non-configurable)
	{
		LangOptions: MarkdownLanguageOptions;
		Code: IMarkdownSourceCode;
		Visitor: MarkdownRuleVisitor;
		Node: Node;
	} & Required<
		// Rule specific type options (custom)
		Options &
			// Rule specific type options (defaults)
			Omit<MarkdownRuleDefinitionTypeOptions, keyof Options>
	>
>;
