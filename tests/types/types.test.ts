import markdown, {
	MarkdownSourceCode,
	MarkdownNode,
	MarkdownRuleDefinition,
	MarkdownRuleVisitor,
	SourceLocation,
	SourceRange,
	type RuleModule,
} from "@eslint/markdown";
import { Toml } from "@eslint/markdown/types";
import { ESLint, Linter } from "eslint";
import type {
	// Nodes (abstract)
	Node,
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

markdown satisfies ESLint.Plugin;
markdown.meta.name satisfies string;
markdown.meta.version satisfies string;

// Check that the processor is defined:
markdown.processors.markdown satisfies object;

// Check that these languages are defined:
markdown.languages.commonmark satisfies object;
markdown.languages.gfm satisfies object;

markdown.configs["recommended-legacy"] satisfies Linter.LegacyConfig;
markdown.configs.recommended satisfies Linter.Config[];
markdown.configs.processor satisfies Linter.Config[];

// Check that `plugins` in the recommended config is empty:
const [{ plugins: recommendedPlugins }] = markdown.configs.recommended;
typeof recommendedPlugins satisfies {};
({}) satisfies typeof recommendedPlugins;

// Check that `plugins` in the processor config is empty:
const [{ plugins: processorPlugins }] = markdown.configs.processor;
typeof processorPlugins satisfies {};
({}) satisfies typeof processorPlugins;

{
	type RecommendedRuleName =
		keyof (typeof markdown.configs.recommended)[0]["rules"];
	type RuleName = `markdown/${keyof typeof markdown.rules}`;
	type AssertAllNamesIn<T1 extends T2, T2> = never;

	// Check that all recommended rule names match the names of existing rules in this plugin.
	null as AssertAllNamesIn<RecommendedRuleName, RuleName>;
}

(): RuleModule => ({
	create({ sourceCode }): MarkdownRuleVisitor {
		sourceCode satisfies MarkdownSourceCode;

		sourceCode.ast satisfies Root;
		sourceCode.lines satisfies string[];
		sourceCode.text satisfies string;

		return {
			// Nodes
			blockquote(node, parent) {
				node satisfies Blockquote;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"blockquote:exit"(node, parent) {
				node satisfies Blockquote;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			break(node, parent) {
				node satisfies Break;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"break:exit"(node, parent) {
				node satisfies Break;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			code(node, parent) {
				node satisfies Code;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"code:exit"(node, parent) {
				node satisfies Code;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			definition(node, parent) {
				node satisfies Definition;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"definition:exit"(node, parent) {
				node satisfies Definition;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			emphasis(node, parent) {
				node satisfies Emphasis;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"emphasis:exit"(node, parent) {
				node satisfies Emphasis;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			heading(node, parent) {
				node satisfies Heading;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"heading:exit"(node, parent) {
				node satisfies Heading;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			html(node, parent) {
				node satisfies Html;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"html:exit"(node, parent) {
				node satisfies Html;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			image(node, parent) {
				node satisfies Image;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"image:exit"(node, parent) {
				node satisfies Image;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			imageReference(node, parent) {
				node satisfies ImageReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"imageReference:exit"(node, parent) {
				node satisfies ImageReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			inlineCode(node, parent) {
				node satisfies InlineCode;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"inlineCode:exit"(node, parent) {
				node satisfies InlineCode;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			link(node, parent) {
				node satisfies Link;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"link:exit"(node, parent) {
				node satisfies Link;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			linkReference(node, parent) {
				node satisfies LinkReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"linkReference:exit"(node, parent) {
				node satisfies LinkReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			list(node, parent) {
				node satisfies List;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"list:exit"(node, parent) {
				node satisfies List;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			listItem(node, parent) {
				node satisfies ListItem;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"listItem:exit"(node, parent) {
				node satisfies ListItem;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			paragraph(node, parent) {
				node satisfies Paragraph;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"paragraph:exit"(node, parent) {
				node satisfies Paragraph;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			root(node) {
				node satisfies Root;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"root:exit"(node) {
				node satisfies Root;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			strong(node, parent) {
				node satisfies Strong;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"strong:exit"(node, parent) {
				node satisfies Strong;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			text(node, parent) {
				node satisfies Text;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"text:exit"(node, parent) {
				node satisfies Text;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			thematicBreak(node, parent) {
				node satisfies ThematicBreak;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"thematicBreak:exit"(node, parent) {
				node satisfies ThematicBreak;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			// Extensions (GFM)
			delete(node, parent) {
				node satisfies Delete;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"delete:exit"(node, parent) {
				node satisfies Delete;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			footnoteDefinition(node, parent) {
				node satisfies FootnoteDefinition;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"footnoteDefinition:exit"(node, parent) {
				node satisfies FootnoteDefinition;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			footnoteReference(node, parent) {
				node satisfies FootnoteReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"footnoteReference:exit"(node, parent) {
				node satisfies FootnoteReference;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			table(node, parent) {
				node satisfies Table;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"table:exit"(node, parent) {
				node satisfies Table;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			tableCell(node, parent) {
				node satisfies TableCell;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"tableCell:exit"(node, parent) {
				node satisfies TableCell;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			tableRow(node, parent) {
				node satisfies TableRow;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"tableRow:exit"(node, parent) {
				node satisfies TableRow;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			// Extensions (front matter)
			yaml(node, parent) {
				node satisfies Yaml;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"yaml:exit"(node, parent) {
				node satisfies Yaml;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			toml(node, parent) {
				node satisfies Toml;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},
			"toml:exit"(node, parent) {
				node satisfies Toml;
				parent satisfies Parent | undefined;
				sourceCode.getLoc(node) satisfies SourceLocation;
				sourceCode.getRange(node) satisfies SourceRange;
				sourceCode.getParent(node) satisfies Node | undefined;
				// @ts-expect-error It should be fixed in https://github.com/eslint/markdown/issues/341
				sourceCode.getAncestors(node) satisfies Node[];
				sourceCode.getText(node) satisfies string;
			},

			// Unknown selectors allowed
			"heading[depth=1]"(node: MarkdownNode, parent?: ParentNode) {},
			"randomSelector:exit"(node: MarkdownNode, parent?: ParentNode) {},
		};
	},
});

// All options optional - MarkdownRuleDefinition, MarkdownRuleDefinition<{}> and RuleModule
// should be the same type.
(
	rule1: MarkdownRuleDefinition,
	rule2: MarkdownRuleDefinition<{}>,
	rule3: RuleModule,
) => {
	rule1 satisfies typeof rule2 satisfies typeof rule3;
	rule2 satisfies typeof rule1 satisfies typeof rule3;
	rule3 satisfies typeof rule1 satisfies typeof rule2;
};

// Type restrictions should be enforced
(): MarkdownRuleDefinition<{
	RuleOptions: [string, number];
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: string; bar: number };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// @ts-expect-error Wrong type for message ID
			bar: 42,
		},
		docs: {
			foo: "FOO",

			// @ts-expect-error Wrong type for declared property
			bar: "BAR",

			// @ts-expect-error Wrong type for predefined property
			description: 42,
		},
	},
	create({ options }) {
		// Types for rule options
		options[0] satisfies string;
		options[1] satisfies number;

		return {};
	},
});

// Undeclared properties should produce an error
(): MarkdownRuleDefinition<{
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: number; bar: string };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// Declared message ID is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared message ID is not allowed
			baz: "BAZ",
		},
		docs: {
			foo: 42,

			// Declared property is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared property key is not allowed
			baz: "BAZ",

			// Predefined property is allowed
			description: "Lorem ipsum",
		},
	},
	create() {
		return {};
	},
});
