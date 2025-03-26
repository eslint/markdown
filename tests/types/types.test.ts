import markdown, {
	IMarkdownSourceCode,
	MarkdownNode,
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
