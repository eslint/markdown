/**
 * @fileoverview Tests for util.js
 * @author 루밀LuMir(lumirlumir)
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import assert from "node:assert";
import { findOffsets } from "../src/util.js";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("util", () => {
	describe("findOffsets()", () => {
		it("should return correct offsets for a simple string", () => {
			const text = "Hello world!";
			const offset = 6; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 0, columnOffset: 6 });
		});

		it("should handle line breaks correctly", () => {
			const text = "Hello\nworld!";
			const offset = 6; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 1, columnOffset: 0 });
		});

		it("should handle Windows-style line endings", () => {
			const text = "Hello\r\nworld!";
			const offset = 7; // 'w' in "world"
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 1, columnOffset: 0 });
		});

		it("should handle offsets at the start of the string", () => {
			const text = "Hello, world!";
			const offset = 0; // Start of the string
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, { lineOffset: 0, columnOffset: 0 });
		});

		it("should handle offsets at the end of the string", () => {
			const text = "Hello, world!";
			const offset = text.length - 1; // Last character '!'
			const result = findOffsets(text, offset);
			assert.deepStrictEqual(result, {
				lineOffset: 0,
				columnOffset: text.length - 1,
			});
		});
	});
});
