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
import type { InlineMath, Math } from "mdast-util-math";
import type {
	LanguageContext,
	LanguageOptions,
	ObjectMetaProperties,
	RuleVisitor,
} from "@eslint/core";
import type {
	CustomRuleDefinitionType,
	CustomRuleTypeDefinitions,
	CustomRuleVisitorWithExit,
} from "@eslint/plugin-kit";
import type {
	InlineConfigComment,
	MarkdownSourceCode,
} from "./language/markdown-source-code.js";

//------------------------------------------------------------------------------
// Exports: Processor
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

//------------------------------------------------------------------------------
// Exports: Nodes
//------------------------------------------------------------------------------

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
 * Registers additional mdast nodes as valid front matter and root content.
 */
declare module "mdast" {
	interface FrontmatterContentMap {
		toml: Toml;
		json: Json;
	}

	interface RootContentMap {
		toml: Toml;
		json: Json;
	}
}

//------------------------------------------------------------------------------
// Exports: Language and Source Code
//------------------------------------------------------------------------------

/**
 * @deprecated Use `MarkdownParserMode` instead.
 */
export type ParserMode = MarkdownParserMode;

/**
 * The mode of the Markdown parser to use.
 * @default "commonmark"
 */
export type MarkdownParserMode = "commonmark" | "gfm";

/**
 * A parser that converts Markdown source text into an
 * [mdast](https://github.com/syntax-tree/mdast#readme) syntax tree.
 */
export type MarkdownParser = ObjectMetaProperties & {
	/**
	 * Parses Markdown source text into an
	 * [mdast](https://github.com/syntax-tree/mdast#readme) syntax tree.
	 * @param text The Markdown source text to parse.
	 * @param options The parser-specific options.
	 * @returns The root of the mdast syntax tree.
	 */
	parse(
		text: string,
		options: Omit<MarkdownLanguageOptions, "parser"> & {
			/**
			 * The mode of the Markdown parser to use.
			 * @default "commonmark"
			 */
			mode: MarkdownParserMode;
		},
	): Root;
};

/**
 * Language options provided for Markdown files.
 */
export interface MarkdownLanguageOptions extends LanguageOptions {
	/**
	 * The options for parsing frontmatter.
	 * @default false
	 */
	frontmatter?: false | "yaml" | "toml" | "json";

	/**
	 * The options for parsing math.
	 * @default false
	 */
	math?: boolean;

	/**
	 * An object with a `parse()` method and optional metadata properties.
	 * If not configured, the default ESLint Markdown parser (`mdast-util-from-markdown`) will be used.
	 */
	parser?: MarkdownParser;
}

/**
 * The context object that is passed to the Markdown language plugin methods.
 */
export type MarkdownLanguageContext = LanguageContext<MarkdownLanguageOptions>;

/**
 * A Markdown syntax element, including nodes and comments.
 */
export type MarkdownSyntaxElement = Node | InlineConfigComment;

export interface MarkdownRuleVisitor
	extends
		RuleVisitor,
		CustomRuleVisitorWithExit<
			{
				root?(node: Root): void;
			} & {
				[
					NodeType in
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
						| Json
						| InlineMath // Extensions (math)
						| Math as NodeType["type"]
				]?: (node: NodeType, parent?: Parent) => void;
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
		Node: MarkdownSyntaxElement;
	},
	Options
>;
