//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type {
	Code,
	Heading,
	Html,
	Link,
	Node,
	Parent,
	Root,
	Text,
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

export interface Block extends Node, BlockBase {
	meta: string | null;
}

export type Message = Linter.LintMessage;

export type RuleType = "problem" | "suggestion" | "layout";

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
 * Generic options for the `SourceCodeBase` type.
 */
export interface SourceCodeBaseTypeOptions {
	LangOptions: LanguageOptions;
	RootNode: unknown;
	SyntaxElementWithLoc: unknown;
	ConfigNode: unknown;
}

export interface MarkdownRuleVisitor
	extends RuleVisitor,
		WithExit<{
			root?(node: Root): void;
			code?(node: Code, parent?: Parent): void;
			heading?(node: Heading, parent?: Parent): void;
			html?(node: Html, parent?: Parent): void;
			link?(node: Link, parent?: Parent): void;
			text?(node: Text, parent?: Parent): void;
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
		Code: MarkdownSourceCode;
		Visitor: MarkdownRuleVisitor;
		Node: Node;
	} & Required<
		// Rule specific type options (custom)
		Options &
			// Rule specific type options (defaults)
			Omit<MarkdownRuleDefinitionTypeOptions, keyof Options>
	>
>;
