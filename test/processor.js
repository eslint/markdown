"use strict";

var assert = require("chai").assert,
	processor = require("../lib/processor");

describe("processor", function() {

	describe("preprocess", function() {

		it("should not crash", function() {
			processor.preprocess("Hello, world!");
		});

		it("should not crash on an empty string", function() {
			processor.preprocess("");
		});

		it("should return an array", function() {
			assert.isArray(processor.preprocess("Hello, world!"));
		});

		it("should ignore normal text", function() {
			var blocks = processor.preprocess("Hello, world!");
			assert.equal(blocks.length, 0);
		});

		it("should ignore inline code", function() {
			var blocks = processor.preprocess("Hello, `{{name}}!");
			assert.equal(blocks.length, 0);
		});

		it("should ignore space-indented code blocks", function() {
			var code = [
				"Hello, world!",
				"    ",
				"    var answer = 6 * 7;",
				"    ",
				"Goodbye"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 0);
		});

		it("should ignore tab-indented code blocks", function() {
			var code = [
				"Hello, world!",
				"\t",
				"\tvar answer = 6 * 7;",
				"\t",
				"Goodbye"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 0);
		});

		it("should ignore code fences with ambiguous syntax", function() {
			var code = [
				"```",
				"var answer = 6 * 7;",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 0);
		});

		it("should find code fences with js syntax", function() {
			var code = [
				"```js",
				"var answer = 6 * 7;",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 1);
		});

		it("should find code fences with javascript syntax", function() {
			var code = [
				"```javascript",
				"var answer = 6 * 7;",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 1);
		});

		it("should find code fences ignoring syntax case", function() {
			var code = [
				"```JavaScript",
				"var answer = 6 * 7;",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 1);
		});

		it("should return the source code in the block", function() {
			var code = [
				"```js",
				"var answer = 6 * 7;",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks[0], "var answer = 6 * 7;\n");
		});

		it("should allow multi-line source code", function() {
			var code = [
				"```js",
				"var answer = 6 * 7;",
				"console.log(answer);",
				"```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks[0], "var answer = 6 * 7;\nconsole.log(answer);\n");
		});

		it("should preserve original line endings", function() {
			var code = [
				"```js",
				"var answer = 6 * 7;",
				"console.log(answer);",
				"```"
			].join("\r\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks[0], "var answer = 6 * 7;\r\nconsole.log(answer);\r\n");
		});

		it("should unindent space-indented code fences", function() {
			var code = [
				"    ```js",
				"    var answer = 6 * 7;",
				"    ```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks[0], "var answer = 6 * 7;\n");
		});

		it("should unindent tab-indented code fences", function() {
			var code = [
				"\t```js",
				"\tvar answer = 6 * 7;",
				"\t```"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks[0], "var answer = 6 * 7;\n");
		});

		it("should find multiple code fences", function() {
			var code = [
				"Hello, world!",
				"",
				"```js",
				"var answer = 6 * 7;",
				"```",
				"",
				"    ```javascript",
				"    console.log(answer);",
				"    ```",
				"",
				"Goodbye"
			].join("\n");
			var blocks = processor.preprocess(code);
			assert.equal(blocks.length, 2);
			assert.equal(blocks[0], "var answer = 6 * 7;\n");
			assert.equal(blocks[1], "console.log(answer);\n");
		});

	});

});
