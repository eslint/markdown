import markdown, {
	MarkdownSourceCode,
	MarkdownRuleDefinition,
	MarkdownRuleVisitor,
	type RuleModule,
} from "@eslint/markdown";
import { Toml } from "@eslint/markdown/types";
import { ESLint, Linter } from "eslint";
import type { SourceLocation, SourceRange } from "@eslint/core";
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

		function testVisitor<NodeType extends Node>(
			node: NodeType,
			parent?: Parent | undefined,
		) {
			sourceCode.getLoc(node) satisfies SourceLocation;
			sourceCode.getRange(node) satisfies SourceRange;
			sourceCode.getParent(node) satisfies Node | undefined;
			sourceCode.getAncestors(node) satisfies Node[];
			sourceCode.getText(node) satisfies string;
		}

		return {
			// Nodes
			blockquote: (...args) => testVisitor<Blockquote>(...args),
			"blockquote:exit": (...args) => testVisitor<Blockquote>(...args),
			break: (...args) => testVisitor<Break>(...args),
			"break:exit": (...args) => testVisitor<Break>(...args),
			code: (...args) => testVisitor<Code>(...args),
			"code:exit": (...args) => testVisitor<Code>(...args),
			definition: (...args) => testVisitor<Definition>(...args),
			"definition:exit": (...args) => testVisitor<Definition>(...args),
			emphasis: (...args) => testVisitor<Emphasis>(...args),
			"emphasis:exit": (...args) => testVisitor<Emphasis>(...args),
			heading: (...args) => testVisitor<Heading>(...args),
			"heading:exit": (...args) => testVisitor<Heading>(...args),
			html: (...args) => testVisitor<Html>(...args),
			"html:exit": (...args) => testVisitor<Html>(...args),
			image: (...args) => testVisitor<Image>(...args),
			"image:exit": (...args) => testVisitor<Image>(...args),
			imageReference: (...args) => testVisitor<ImageReference>(...args),
			"imageReference:exit": (...args) =>
				testVisitor<ImageReference>(...args),
			inlineCode: (...args) => testVisitor<InlineCode>(...args),
			"inlineCode:exit": (...args) => testVisitor<InlineCode>(...args),
			link: (...args) => testVisitor<Link>(...args),
			"link:exit": (...args) => testVisitor<Link>(...args),
			linkReference: (...args) => testVisitor<LinkReference>(...args),
			"linkReference:exit": (...args) =>
				testVisitor<LinkReference>(...args),
			list: (...args) => testVisitor<List>(...args),
			"list:exit": (...args) => testVisitor<List>(...args),
			listItem: (...args) => testVisitor<ListItem>(...args),
			"listItem:exit": (...args) => testVisitor<ListItem>(...args),
			paragraph: (...args) => testVisitor<Paragraph>(...args),
			"paragraph:exit": (...args) => testVisitor<Paragraph>(...args),
			root: (...args) => testVisitor<Root>(...args),
			"root:exit": (...arg) => testVisitor<Root>(...arg),
			strong: (...args) => testVisitor<Strong>(...args),
			"strong:exit": (...args) => testVisitor<Strong>(...args),
			text: (...args) => testVisitor<Text>(...args),
			"text:exit": (...args) => testVisitor<Text>(...args),
			thematicBreak: (...args) => testVisitor<ThematicBreak>(...args),
			"thematicBreak:exit": (...args) =>
				testVisitor<ThematicBreak>(...args),

			// Extensions (GFM)
			delete: (...args) => testVisitor<Delete>(...args),
			"delete:exit": (...args) => testVisitor<Delete>(...args),
			footnoteDefinition: (...args) =>
				testVisitor<FootnoteDefinition>(...args),
			"footnoteDefinition:exit": (...args) =>
				testVisitor<FootnoteDefinition>(...args),
			footnoteReference: (...args) =>
				testVisitor<FootnoteReference>(...args),
			"footnoteReference:exit": (...args) =>
				testVisitor<FootnoteReference>(...args),
			table: (...args) => testVisitor<Table>(...args),
			"table:exit": (...args) => testVisitor<Table>(...args),
			tableCell: (...args) => testVisitor<TableCell>(...args),
			"tableCell:exit": (...args) => testVisitor<TableCell>(...args),
			tableRow: (...args) => testVisitor<TableRow>(...args),
			"tableRow:exit": (...args) => testVisitor<TableRow>(...args),

			// Extensions (front matter)
			yaml: (...args) => testVisitor<Yaml>(...args),
			"yaml:exit": (...args) => testVisitor<Yaml>(...args),
			toml: (...args) => testVisitor<Toml>(...args),
			"toml:exit": (...args) => testVisitor<Toml>(...args),

			// Unknown selectors allowed
			"heading[depth=1]"(node: Node, parent?: ParentNode) {},
			"randomSelector:exit"(node: Node, parent?: ParentNode) {},
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
