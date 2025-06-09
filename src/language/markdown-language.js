/**
 * @fileoverview Functions to fix up rules to provide missing methods on the `context` object.
 * @author Nicholas C. Zakas
 */

/* eslint class-methods-use-this: 0 -- Required to complete interface. */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { MarkdownSourceCode } from "./markdown-source-code.js";
import { fromMarkdown } from "mdast-util-from-markdown";
import { frontmatterFromMarkdown } from "mdast-util-frontmatter";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { frontmatter } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Root} RootNode */
/** @typedef {import("mdast-util-from-markdown").Options['extensions']} Extensions */
/** @typedef {import("mdast-util-from-markdown").Options['mdastExtensions']} MdastExtensions */
/** @typedef {import("@eslint/core").Language} Language */
/** @typedef {import("@eslint/core").File} File */
/** @typedef {import("@eslint/core").ParseResult<RootNode>} ParseResult */
/** @typedef {import("@eslint/core").OkParseResult<RootNode>} OkParseResult */
/** @typedef {import("../types.ts").MarkdownLanguageOptions} MarkdownLanguageOptions */
/** @typedef {import("../types.ts").MarkdownLanguageContext} MarkdownLanguageContext */
/** @typedef {"commonmark"|"gfm"} ParserMode */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Parser configuration for JSON frontmatter.
 * Example of supported frontmatter format:
 * ```markdown
 * ---
 * {
 *   "title": "My Document",
 *   "date": "2025-06-09"
 * }
 * ---
 * ```
 */
const jsonFrontmatterConfig = {
	type: "json",
	marker: "-",
};

/**
 * Create parser options based on `mode` and `languageOptions`.
 * @param {ParserMode} mode The markdown parser mode.
 * @param {MarkdownLanguageOptions} languageOptions Language options.
 * @returns {{extensions: Extensions, mdastExtensions: MdastExtensions}} Parser options for micromark and mdast
 */
function createParserOptions(mode, languageOptions) {
	/** @type {Extensions} */
	const extensions = [];
	/** @type {MdastExtensions} */
	const mdastExtensions = [];

	// 1. `mode`: Add GFM extensions if mode is "gfm"
	if (mode === "gfm") {
		extensions.push(gfm());
		mdastExtensions.push(gfmFromMarkdown());
	}

	// 2. `languageOptions.frontmatter`: Handle frontmatter options
	const frontmatterOption = languageOptions?.frontmatter;

	// Skip frontmatter entirely if false
	if (frontmatterOption !== false) {
		if (frontmatterOption === "yaml") {
			extensions.push(frontmatter(["yaml"]));
			mdastExtensions.push(frontmatterFromMarkdown(["yaml"]));
		} else if (frontmatterOption === "toml") {
			extensions.push(frontmatter(["toml"]));
			mdastExtensions.push(frontmatterFromMarkdown(["toml"]));
		} else if (frontmatterOption === "json") {
			extensions.push(frontmatter(jsonFrontmatterConfig));
			mdastExtensions.push(
				frontmatterFromMarkdown(jsonFrontmatterConfig),
			);
		}
	}

	return {
		extensions,
		mdastExtensions,
	};
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Markdown Language Object
 * @implements {Language}
 */
export class MarkdownLanguage {
	/**
	 * The type of file to read.
	 * @type {"text"}
	 */
	fileType = "text";

	/**
	 * The line number at which the parser starts counting.
	 * @type {0|1}
	 */
	lineStart = 1;

	/**
	 * The column number at which the parser starts counting.
	 * @type {0|1}
	 */
	columnStart = 1;

	/**
	 * The name of the key that holds the type of the node.
	 * @type {string}
	 */
	nodeTypeKey = "type";

	/**
	 * Default language options. User-defined options are merged with this object.
	 * @type {MarkdownLanguageOptions}
	 */
	defaultLanguageOptions = {
		frontmatter: false,
	};

	/**
	 * The Markdown parser mode.
	 * @type {ParserMode}
	 */
	#mode = "commonmark";

	/**
	 * Creates a new instance.
	 * @param {Object} options The options to use for this instance.
	 * @param {ParserMode} [options.mode] The Markdown parser mode to use.
	 */
	constructor({ mode } = {}) {
		if (mode) {
			this.#mode = mode;
		}
	}

	/**
	 * Validates the language options.
	 * @param {MarkdownLanguageOptions} languageOptions The language options to validate.
	 * @returns {void}
	 * @throws {Error} When the language options are invalid.
	 */
	validateLanguageOptions(languageOptions) {
		const frontmatterOption = languageOptions?.frontmatter;
		const validFrontmatterOptions = new Set([
			false,
			"yaml",
			"toml",
			"json",
		]);

		if (
			frontmatterOption !== undefined &&
			!validFrontmatterOptions.has(frontmatterOption)
		) {
			throw new Error(
				`Invalid language option value \`${frontmatterOption}\` for frontmatter.`,
			);
		}
	}

	/**
	 * Parses the given file into an AST.
	 * @param {File} file The virtual file to parse.
	 * @param {MarkdownLanguageContext} context The options to use for parsing.
	 * @returns {ParseResult} The result of parsing.
	 */
	parse(file, context) {
		// Note: BOM already removed
		const text = /** @type {string} */ (file.body);

		/*
		 * Check for parsing errors first. If there's a parsing error, nothing
		 * else can happen. However, a parsing error does not throw an error
		 * from this method - it's just considered a fatal error message, a
		 * problem that ESLint identified just like any other.
		 */
		try {
			const options = createParserOptions(
				this.#mode,
				context?.languageOptions,
			);
			const root = fromMarkdown(text, options);

			return {
				ok: true,
				ast: root,
			};
		} catch (ex) {
			return {
				ok: false,
				errors: [ex],
			};
		}
	}

	/**
	 * Creates a new `MarkdownSourceCode` object from the given information.
	 * @param {File} file The virtual file to create a `MarkdownSourceCode` object from.
	 * @param {OkParseResult} parseResult The result returned from `parse()`.
	 * @returns {MarkdownSourceCode} The new `MarkdownSourceCode` object.
	 */
	createSourceCode(file, parseResult) {
		return new MarkdownSourceCode({
			text: /** @type {string} */ (file.body),
			ast: parseResult.ast,
		});
	}
}
