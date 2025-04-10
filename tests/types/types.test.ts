import markdown, {
	IMarkdownSourceCode,
	MarkdownNode,
	MarkdownRuleDefinition,
	MarkdownRuleVisitor,
	ParentNode,
	RootNode,
	SourceLocation,
	TextNode,
	type RuleModule,
} from "@eslint/markdown";
import { ESLint, Linter } from "eslint";

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
		sourceCode satisfies IMarkdownSourceCode;

		sourceCode.ast satisfies RootNode;
		sourceCode.lines satisfies string[];

		return {
			// Root selector
			root(node) {
				node satisfies RootNode;
			},

			// Known node selector, sourceCode methods used in visitor
			text(node) {
				node satisfies TextNode;
				sourceCode.getText(node) satisfies string;
				sourceCode.getLoc(node) satisfies SourceLocation;
			},

			// Known node selector with parent
			link(node, parent) {
				node satisfies MarkdownNode;
				parent satisfies ParentNode | undefined;
			},

			// Known node selector with ":exit"
			"html:exit"(node, parent) {
				node satisfies MarkdownNode;
				parent satisfies ParentNode | undefined;
			},

			// Unknown selectors allowed
			"heading[depth=1]"(node: MarkdownNode, parent?: ParentNode) {},
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
