import { parse, renderSync } from "../src/";
import { describe, expect, it } from "vitest";

describe("markdown", () => {
	it("works", async () => {
		const input =
			'<p>Token CSS is a new tool that seamlessly integrates <a href="https://design-tokens.github.io/community-group/format/#design-token">Design Tokens</a> into your development workflow. Conceptually, it is similar to tools <a href="https://tailwindcss.com">Tailwind</a>, <a href="https://styled-system.com/">Styled System</a>, and many CSS-in-JS libraries that provide tokenized <em>constraints</em> for your styles—but there\'s one big difference.</p>\t<h1>Hello world!</h1><p><strong>Token CSS embraces <code>.css</code> files and <code>&lt;style&gt;</code> blocks.</strong></p>';
		const output = renderSync(parse(input));
		expect(input).eq(output);
	});
});
