/**
 * @fileoverview Tests for the html.js
 * @author Json Miller, Nate Moore, 루밀LuMir(lumirlumir)
 * @license MIT
 *
 * ---
 *
 * Portions of this code were borrowed from `ultrahtml` - https://github.com/natemoo-re/ultrahtml
 *
 * MIT License Copyright (c) 2022 Nate Moore
 *
 * Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 * The above copyright notice and this permission notice
 * (including the next paragraph) shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * ---
 *
 * Portions of this code were borrowed from `htmlParser` - https://github.com/developit/htmlParser
 *
 * The MIT License (MIT) Copyright (c) 2013 Jason Miller
 *
 * Permission is hereby granted, free of
 * charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "node:assert";
import { parse, walkSync, renderSync, querySelectorAll } from "../src/html.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("html", () => {
	it("sanity", () => {
		assert.strictEqual(typeof parse, "function");
		assert.strictEqual(typeof walkSync, "function");
		assert.strictEqual(typeof renderSync, "function");
		assert.strictEqual(typeof querySelectorAll, "function");
	});

	describe("parse(), renderSync()", () => {
		describe("input === output", () => {
			it("works for elements", async () => {
				const input = `<h1>Hello world!</h1>`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for custom elements", async () => {
				const input = `<custom-element>Hello world!</custom-element>`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for comments", async () => {
				const input = `<!--foobar-->`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for text", async () => {
				const input = `Hmm...`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for doctype", async () => {
				const input = `<!DOCTYPE html>`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for html:5", async () => {
				const input = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body></body></html>`;
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
			it("works for long inputs", async () => {
				const input =
					'<p>Token CSS is a new tool that seamlessly integrates <a href="https://design-tokens.github.io/community-group/format/#design-token">Design Tokens</a> into your development workflow. Conceptually, it is similar to tools <a href="https://tailwindcss.com">Tailwind</a>, <a href="https://styled-system.com/">Styled System</a>, and many CSS-in-JS libraries that provide tokenized <em>constraints</em> for your styles—but there\'s one big difference.</p>\t<h1>Hello world!</h1><p><strong>Token CSS embraces <code>.css</code> files and <code>&lt;style&gt;</code> blocks.</strong></p>';
				const ast = parse(input);
				const output = renderSync(ast);

				assert.strictEqual(ast.type, "document");
				assert.strictEqual(output, input);
			});
		});

		describe("attributes", () => {
			it("simple", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div a="b" c="1"></div>`);

				assert.deepStrictEqual(attributes, { a: "b", c: "1" });
			});
			it("empty", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div test></div>`);

				assert.deepStrictEqual(attributes, { test: "" });
			});
			it("@", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div @on.click="doThing"></div>`);

				assert.deepStrictEqual(attributes, { "@on.click": "doThing" });
			});
			it("namespace", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div on:click="alert()"></div>`);

				assert.deepStrictEqual(attributes, { "on:click": "alert()" });
			});
			it("simple and empty", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div test a="b" c="1"></div>`);

				assert.deepStrictEqual(attributes, {
					test: "",
					a: "b",
					c: "1",
				});
			});
			it("with linebreaks", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div a="1
2
3"></div>`);

				assert.deepStrictEqual(attributes, { a: "1\n2\n3" });
			});
			it("with single quote", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div a="nate'
s"></div>`);
				assert.deepStrictEqual(attributes, { a: "nate'\ns" });
			});
			it("with escaped double quote", async () => {
				const {
					children: [{ attributes }],
				} = parse(`<div a="&quot;never
more&quot;"></div>`);

				assert.deepStrictEqual(attributes, {
					a: "&quot;never\nmore&quot;",
				});
			});
		});

		describe("script", () => {
			it("works for elements", async () => {
				const input = `<script>console.log("Hello <name>!")</script>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
			it("works without quotes", async () => {
				const input = `<script>0<1>0</name></script>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
			it("works with <script> in string", async () => {
				const input = `<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="icon" href="/favicon-48x48.cbbd161b.png"/><link rel="apple-touch-icon" href="/apple-touch-icon.6803c6f0.png"/><meta name="theme-color" content="#ffffff"/><link rel="manifest" href="/manifest.56b1cedc.json"/><link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="MDN Web Docs"/><script>Array.prototype.flat&&Array.prototype.includes||document.write('<script src="https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.flat%2Ces6"></script>')</script><title>HTML Sanitizer API - Web APIs | MDN</title><link rel="alternate" title="HTML Sanitizer API" href="https://developer.mozilla.org/ja/docs/Web/API/HTML_Sanitizer_API" hreflang="ja"/><link rel="alternate" title="HTML Sanitizer API" href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API" hreflang="en"/><meta name="robots" content="index, follow"><meta name="description" content="The HTML Sanitizer API allow developers to take untrusted strings of HTML and Document or DocumentFragment objects, and sanitize them for safe insertion into a document&apos;s DOM."/><meta property="og:url" content="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API"/><meta property="og:title" content="HTML Sanitizer API - Web APIs | MDN"/><meta property="og:locale" content="en-US"/><meta property="og:description" content="The HTML Sanitizer API allow developers to take untrusted strings of HTML and Document or DocumentFragment objects, and sanitize them for safe insertion into a document&apos;s DOM."/><meta property="og:image" content="https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png"/><meta property="twitter:card" content="summary_large_image"/><link rel="canonical" href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API"/><style media="print">.breadcrumbs-container,.document-toc-container,.language-menu,.on-github,.page-footer,.top-navigation-main,nav.sidebar,ul.prev-next{display:none!important}.main-page-content,.main-page-content pre{padding:2px}.main-page-content pre{border-left-width:2px}</style><script src="/static/js/ga.js" defer=""></script><script defer="defer" src="/static/js/main.bfba1cdc.js"></script><link href="/static/css/main.7fcd0907.css" rel="stylesheet">`;
				let meta = 0;
				walkSync(parse(input), async (node, parent) => {
					if (
						node.type === "element" &&
						node.name === "meta" &&
						parent?.name === "head"
					) {
						meta++;
					}
				});

				assert.strictEqual(meta, 11);
			});
			it("works with <script> inside script", async () => {
				const input = `<script>const a = "<script>"</script>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
			it("works with <any> inside script", async () => {
				const input = `<script>const a = "<any>"</script>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
			it("works with <\\/script> inside script", async () => {
				const input = `<script>const a = "<\\/script>"</script>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
		});

		describe("style", () => {
			it("works for elements", async () => {
				const input = `<style><name></name><foo></style>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
			it("works without quotes", async () => {
				const input = `<style>0>1</name></style>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
		});

		describe("svg", () => {
			it("renderSync as self-closing", async () => {
				const input = `<svg><path d="0 0 0" /></svg>`;
				const output = renderSync(parse(input));

				assert.strictEqual(output, input);
			});
		});
	});

	describe("querySelector()", () => {
		describe("type selector", () => {
			it("type", async () => {
				const input = `<h1>Hello world!</h1>`;
				const output = renderSync(
					querySelectorAll(parse(input), "h1")[0],
				);

				assert.strictEqual(output, input);
			});
		});

		/*

		describe("id selector", () => {
			it("id", async () => {
				const input = `<h1 id="foo">Hello world!</h1>`;
				const output = renderSync(querySelectorAll(parse(input), "#foo")[0]);
				expect(output).toEqual(input);
			});
		});

		*/
	});
});
