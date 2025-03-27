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
import { frontmatter, toMatters } from "micromark-extension-frontmatter";
import { gfm } from "micromark-extension-gfm";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("mdast").Root} RootNode */
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
 * Create frontmatter extensions based on `frontmatter` language options.
 * @param {MarkdownLanguageOptions['frontmatter']} languageOptionsFrontmatter Language options for frontmatter.
 * @returns {{extensions: any[], mdastExtensions: any[]}} Extensions for `micromark` and `mdast-util` parsers.
 */
function createFrontmatterExtensions(languageOptionsFrontmatter) {
	// Skip frontmatter entirely if false.
	if (languageOptionsFrontmatter === false) {
		return { extensions: [], mdastExtensions: [] };
	}

	// Use default YAML if true.
	if (languageOptionsFrontmatter === true) {
		return {
			extensions: [frontmatter(["yaml"])],
			mdastExtensions: [frontmatterFromMarkdown(["yaml"])],
		};
	}

	// We know that `languageOptions.frontmatter` is not a boolean here.
	// If it's not a boolean, it must be `FrontmatterOptions` type.

	// Otherwise use the provided options.
	return {
		extensions: [frontmatter(languageOptionsFrontmatter)],
		mdastExtensions: [frontmatterFromMarkdown(languageOptionsFrontmatter)],
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
		if (languageOptions.frontmatter !== undefined) {
			if (typeof languageOptions.frontmatter === "boolean") {
				return;
			}

			// We know that `languageOptions.frontmatter` is not a boolean here.
			// If it's not a boolean, it must be `FrontmatterOptions` type.

			// `toMatters` throws an `Error` if the options are invalid.
			// So, we don't have to implement the validations by ourselves.
			toMatters(languageOptions.frontmatter);
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
		const {
			extensions: frontmatterExtensions,
			mdastExtensions: frontmatterMdastExtensions,
		} = createFrontmatterExtensions(context?.languageOptions?.frontmatter); // TODO: Need to be refactored.

		/*
		 * Check for parsing errors first. If there's a parsing error, nothing
		 * else can happen. However, a parsing error does not throw an error
		 * from this method - it's just considered a fatal error message, a
		 * problem that ESLint identified just like any other.
		 */
		try {
			const options =
				this.#mode === "gfm"
					? {
							extensions: [gfm(), ...frontmatterExtensions],
							mdastExtensions: [
								gfmFromMarkdown(),
								...frontmatterMdastExtensions,
							],
						}
					: {
							extensions: [...frontmatterExtensions],
							mdastExtensions: [...frontmatterMdastExtensions],
						};
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
