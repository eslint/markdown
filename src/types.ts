import type { Node } from "mdast";
import type { Linter } from "eslint";
import type {
	RuleDefinition,
	RuleDefinitionTypeOptions,
	TextSourceCode,
} from "@eslint/core";

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
 * The `SourceCode` interface for Markdown files.
 */
export interface IMarkdownSourceCode extends TextSourceCode {
	/**
	 * Gets the entire source text split into an array of lines.
	 * @returns {Array<string>} The source text as an array of lines.
	 * @public
	 */
	get lines(): Array<string>;

	/**
	 * Gets the source code for the given node.
	 * @param {object} [node] The AST node to get the text for.
	 * @param {number} [beforeCount] The number of characters before the node to retrieve.
	 * @param {number} [afterCount] The number of characters after the node to retrieve.
	 * @returns {string} The text representing the AST node.
	 * @public
	 */
	getText(node?: object, beforeCount?: number, afterCount?: number): string;
}

export type MarkdownRuleVisitor = Record<
	string,
	((node: Node) => void) | undefined
>;

export type MarkdownRuleDefinition<
	MarkdownRuleOptions extends unknown[] = unknown[],
> = RuleDefinition<
	RuleDefinitionTypeOptions & {
		Code: IMarkdownSourceCode;
		RuleOptions: MarkdownRuleOptions;
		Visitor: MarkdownRuleVisitor;
		Node: Node;
	}
>;
