/**
 * @fileoverview Tests for no-space-in-emphasis rule.
 * @author Pixel998
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-space-in-emphasis.js";
import markdown from "../../src/index.js";
import { RuleTester } from "eslint";
import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		markdown,
	},
	language: "markdown/gfm",
});

ruleTester.run("no-space-in-emphasis", rule, {
	valid: [
		"Line with *Normal emphasis*",
		"Line with **Normal strong**",
		"Line with ***Normal strong and emphasis***",
		"Line with _Normal emphasis_",
		"Line with __Normal strong__",
		"Line with ___Normal strong and emphasis___",
		"Line with ~Normal strikethrough~",
		"Line with ~~Normal strikethrough~~",
		"Line with ~~*strikethrough and emphasis*~~",
		"But not with escaped\\* asterisks\\* \\_and \\_underscores.",
		"But not with escaped\\~ tildes\\~ either.",
		"* Emphasis* with left space is recognized as a list",
		dedent`
		* List item *with emphasis* on the
		  first and *second lines*.
		`,
		dedent`
		* List item with
		  *hanging* emphasis
		`,
		"***strong emph***",
		"***strong** in emph*",
		"***emph* in strong**",
		"**in strong *emph***",
		"*in emph **strong***",
		"**in strong * emph*** (internal spaces are not detected)",
		"*in emph ** strong*** (internal spaces are not detected)",
		"***strong ** in emph* (internal spaces are not detected)",
		"***emph * in strong** (internal spaces are not detected)",
		"Text *emph***strong** text",
		dedent`
		\`\`\`markdown
        Violations * are * allowed in code blocks where emphasis does not apply.
        \`\`\`
        `,
		dedent`
		\`\`\`markdown
        Violations ~~ are ~~ allowed in code blocks where strikethrough does not apply.
        \`\`\`
        `,
		"Emphasis `inside * code * blocks` is okay.",
		"Emphasis `* inside` code `blocks *` is okay.",
		"Emphasis `inside *` code `* blocks` is okay.",
		"Emphasis `inside _ code _ blocks` is okay.",
		"Emphasis `_ inside` code `blocks _` is okay.",
		"Emphasis `inside _` code `_ blocks` is okay.",
		"Mixed `code_span` scenarios are _also_ okay.",
		"Mixed `code*span` scenarios are *also* okay.",
		"Mixed `code*span` scenarios are _also_ okay.",
		"Mixed `code_span` scenarios are *also* okay.",
		"Text ~ strikethrough ~ with spaces",
		"Text ~~ strikethrough ~~ with spaces",
		"[Link](under_score) followed by _underscore_",
		"[Link](un_der_score) followed by _underscore_",
		"[Link](un_der_sco_re) followed by _underscore_",
		"[Link](star*star) followed by *star*",
		"* [Link](star*star) followed by *star*",
		"Text [Link](under_score) text _underscore_ text [Link](st*ar) text *star* text",
		"[Link [link] link](under_score) followed by _underscore_",
		"**under_score** text *under_score*",
		"*under_score* text **under_score**",
		"__star*star__ text _star*star_",
		"_star*star_ text __star*star__",
		"*_emphasis* text *emphasis*",
		"*emphasis_* text *emphasis*",
		"*emphasis* text *_emphasis*",
		"*emphasis* text *emphasis_*",
		"text \\*emphasis* text *emphasis* text",
		"text *emphasis\\* text *emphasis* text",
		"text *emphasis* text \\*emphasis* text",
		"text *emphasis* text *emphasis\\* text",
		"text *star*_underscore_ text **star**_underscore_ text",
		"text **star**_underscore_ text *star*_underscore_ text",
		"text **star**_underscore_ text **star**_underscore_ text",
		"text *star*_underscore_ text *star*__underscore__ text",
		"text *star*__underscore__ text *star*_underscore_ text",
		"text *star*__underscore__ text *star*__underscore__ text",
		"text _underscore_*star* text __underscore__*star* text",
		"text __underscore__*star* text _underscore_*star* text",
		"text __underscore__*star* text __underscore__*star* text",
		"text _underscore_*star* text _underscore_**star** text",
		"text _underscore_**star** text _underscore_*star* text",
		"text _underscore_**star** text _underscore_**star** text",
		"text ~~strike~~*star* text ~strike~**star** text",
		"text ~~strike~~_underscore_ text ~strike~__underscore__ text",
		dedent`
		> * List with *emphasis* in blockquote
		>
		> > * List with *emphasis* in blockquote
		`,
		"`* text *`",
		"`** text **`",
		"`*** text ***`",
		"`**** text ****`",
		"`***** text *****`",
		"`****** text ******`",
		"`******* text *******`",
		"under_score\n_underscore_",
		"st*ar\n*star*",
		"under_score\n*star*",
		"st*ar\n_underscore_",
		"*star*\n_underscore_",
		"_underscore_\n*star*",
		dedent`
		[reference_link]
		_first_ and _second_

		[reference_link]: https://example.com
		`,
		dedent`
		[reference_link]
		*first* and *second*

		[reference_link]: https://example.com
		`,
		dedent`
		[reference*link]
		_first_ and _second_

		[reference*link]: https://example.com
		`,
		dedent`
		[reference*link]
		*first* and *second*

		[reference*link]: https://example.com
		`,
		dedent`
		text [reference_link] under _ score text

		[reference_link]: https://example.com
		`,
		dedent`
		text [reference*link] star * star text

		[reference*link]: https://example.com
		`,
		dedent`
		***text
		*text*
		***
		`,
		dedent`
		*** text
		*text*
		***
		`,
		dedent`
		*** text
		\*text\*
		***
		`,
		dedent`
		*** text
		**text**
		***
		`,
		dedent`
		| Table | Table |
		| ----- | ----- |
		| star  | x * y |
		| under | x _ y |
		`,
		dedent`
		| Table | Table |
		| ----- | ----- |
		| star  | x * y |
		| star  | x * y |
		| under | x _ y |
		| under | x _ y |
		`,
		dedent`
		| Table | Table                     |
		| ----- | ------------------------- |
		| star  | text *text* text          |
		| under | text _text_ text          |
		| strike| text ~text~ text          |
		`,
		dedent`
		| Table | Table |
		| ----- | ----- |
		| x * y | x * y |
		| x** y | x** y |
		| x _ y | x _ y |
		| x__ y | x__ y |
		`,
		dedent`
		\`\`\`yaml /* autogenerated */
		# YAML...
		\`\`\`
		`,
		"new_value from *old_value* and *older_value*.",
		":ballot_box_with_check: _Emoji syntax_",
		"some_snake_case_function() is _called_",
		"_~/.ssh/id_rsa_ and _emphasis_",
		"Partial *em*phasis of a *wo*rd.",
		dedent`
		<p>
		Emphasis inside * HTML * content
		</p>
		`,
		'Emphasis <p data="inside * attribute * content"></p>',
		"Embedded underscore is okay:\nText _emphas_i_s_ text _emphasis_",
		"Text *emphasis\nemphasis* text",
		"Text *emphasis* *emphasis\nemphasis* *emphasis* text",
		"Text *emphasis* text *emphasis\nemphasis* text *emphasis* text",
		"Text *emphasis* *emphasis\nemphasis* *emphasis* *emphasis\nemphasis* text *emphasis\nemphasis* text *emphasis* text",
		"Text text\ntext *emphasis\nemphasis emphasis\nemphasis* text\ntext text",
		"Text * asterisk",
		"* Item *emphasis* item\n* Item *emphasis* item\n* Item *emphasis\n  emphasis* item\n* Item *emphasis* item",
		"* Item * asterisk\n* Item * asterisk",
		"Emphasis `inside\nof * code *\nblocks` is okay.",
		"Emphasis `* inside`\ncode\n`blocks *` is okay.",
		"Emphasis `inside *`\ncode\n`* blocks` is okay.",
		"Emphasis `inside\n_ code _\nblocks` is okay.",
		"Emphasis `_ inside`\ncode\n`blocks _` is okay.",
		"Emphasis `inside _`\ncode\n`_ blocks` is okay.",
		"Mixed `code_span`\nscenarios\nare _also_ okay.",
		"Mixed `code*span`\nscenarios\nare *also* okay.",
		"This paragraph\ncontains *a* mix\nof `*` emphasis\nscenarios and *should*\nnot trigger `*` any\nviolations at *all*.",
		"This paragraph\ncontains `a * slightly\nmore complicated\nmulti-line emphasis\nscenario * that\nshould * not trigger\nviolations * either`.",
		"Escaped asterisks \\* should \\* be ignored.",
		"Escaped asterisks \\* should * be ignored.",
		"Escaped asterisks * should \\* be ignored.",
		"Escaped underscores \\_ should \\_ be ignored.",
		"Escaped underscores \\_ should _ be ignored.",
		"Escaped underscores _ should \\_ be ignored.",
		"Escaped asterisks \\** should ** be ignored.",
		"Escaped asterisks *\\* should ** be ignored.",
		"Escaped underscores \\__ should __ be ignored.",
		"Escaped underscores _\\_ should __ be ignored.",
		"Escaped asterisks ** should \\** be ignored.",
		"Escaped asterisks ** should *\\* be ignored.",
		"Escaped underscores __ should \\__ be ignored.",
		"Escaped underscores __ should _\\_ be ignored.",
		"Escaped tildes \\~ should \\~ be ignored.",
		"Escaped tildes \\~~ should ~~ be ignored.",
		"This is *\u00A0some\u00A0* text",
	],
	invalid: [
		{
			code: "Broken * emphasis * with spaces",
			output: "Broken *emphasis* with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "Broken ** strong ** with spaces",
			output: "Broken **strong** with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "Broken *** strong and emphasis *** with spaces",
			output: "Broken ***strong and emphasis*** with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: "Broken _ emphasis _ with spaces",
			output: "Broken _emphasis_ with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "Broken __ strong __ with spaces",
			output: "Broken __strong__ with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "Broken ___ strong and emphasis ___ with spaces",
			output: "Broken ___strong and emphasis___ with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: "Mixed *ok emphasis* and * broken emphasis *",
			output: "Mixed *ok emphasis* and *broken emphasis*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 28,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 41,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: "Mixed **ok strong** and ** broken strong **",
			output: "Mixed **ok strong** and **broken strong**",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 40,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: "Mixed ***ok strong and emphasis*** and *** broken strong and emphasis ***",
			output: "Mixed ***ok strong and emphasis*** and ***broken strong and emphasis***",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 40,
					endLine: 1,
					endColumn: 45,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 69,
					endLine: 1,
					endColumn: 74,
				},
			],
		},
		{
			code: "Mixed _ok emphasis_ and _ broken emphasis _",
			output: "Mixed _ok emphasis_ and _broken emphasis_",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 28,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 41,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: "Mixed __ok strong__ and __ broken strong __",
			output: "Mixed __ok strong__ and __broken strong__",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 40,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: "Mixed ___ok strong and emphasis___ and ___ broken strong and emphasis ___",
			output: "Mixed ___ok strong and emphasis___ and ___broken strong and emphasis___",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 40,
					endLine: 1,
					endColumn: 45,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 69,
					endLine: 1,
					endColumn: 74,
				},
			],
		},
		{
			code: "Mixed *ok emphasis* **ok strong** * broken emphasis *",
			output: "Mixed *ok emphasis* **ok strong** *broken emphasis*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 35,
					endLine: 1,
					endColumn: 38,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 54,
				},
			],
		},
		{
			code: "Multiple * broken emphasis * _ broken emphasis _",
			output: "Multiple *broken emphasis* _broken emphasis_",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 33,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 46,
					endLine: 1,
					endColumn: 49,
				},
			],
		},
		{
			code: "One-sided *broken emphasis *",
			output: "One-sided *broken emphasis*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: "One-sided * broken emphasis*",
			output: "One-sided *broken emphasis*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "Will _flag on _words with underscores before them.",
			output: "Will _flag on_words with underscores before them.",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 13,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "The same goes for words* with asterisks* after them.",
			output: "The same goes for words*with asterisks* after them.",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "** Strong** with left space",
			output: "**Strong** with left space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "*** Strong and emphasis*** with left space",
			output: "***Strong and emphasis*** with left space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "_ Emphasis_ with left space",
			output: "_Emphasis_ with left space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: "__ Strong__ with left space",
			output: "__Strong__ with left space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "___ Strong and emphasis___ with left space",
			output: "___Strong and emphasis___ with left space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "*Emphasis * with right space",
			output: "*Emphasis* with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "**Strong ** with right space",
			output: "**Strong** with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "***Strong and emphasis *** with right space",
			output: "***Strong and emphasis*** with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "_Emphasis _ with right space",
			output: "_Emphasis_ with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "__Strong __ with right space",
			output: "__Strong__ with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "___Strong and emphasis ___ with right space",
			output: "___Strong and emphasis___ with right space",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "**Multiple ** spaces **in ** emphasis **at ** once.",
			output: "**Multiple** spaces **in** emphasis **at** once.",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 14,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 46,
				},
			],
		},
		{
			code: "This is * an ambiguous * scenario",
			output: "This is *an ambiguous* scenario",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: "* List * item*",
			output: "* List *item*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "* List *item *",
			output: "* List *item*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "* List * item *",
			output: "* List *item*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 13,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "*** strong emph***",
			output: "***strong emph***",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "***strong emph ***",
			output: "***strong emph***",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "Text * emph***strong** text",
			output: "Text *emph***strong** text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "Text *emph ***strong** text",
			output: "Text *emph***strong** text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "Text *emph*** strong** text",
			output: "Text *emph***strong** text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "Text *emph***strong ** text",
			output: "Text *emph***strong** text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "Emphasis <b>inside * HTML * content</b>",
			output: "Emphasis <b>inside *HTML* content</b>",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 23,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: 'Emphasis <p data="* attribute *">* HTML *</p>',
			output: 'Emphasis <p data="* attribute *">*HTML*</p>',
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 37,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 39,
					endLine: 1,
					endColumn: 42,
				},
			],
		},
		{
			code: "Text * emphasis\nemphasis* text",
			output: "Text *emphasis\nemphasis* text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "Text *emphasis\nemphasis * text",
			output: "Text *emphasis\nemphasis* text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 8,
					endLine: 2,
					endColumn: 11,
				},
			],
		},
		{
			code: "Text * emphasis\nemphasis * text",
			output: "Text *emphasis\nemphasis* text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 8,
					endLine: 2,
					endColumn: 11,
				},
			],
		},
		{
			code: "Text * emphasis * * emphasis\nemphasis * * emphasis * text",
			output: "Text *emphasis* *emphasis\nemphasis* *emphasis* text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 18,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 22,
				},
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 8,
					endLine: 2,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 12,
					endLine: 2,
					endColumn: 15,
				},
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 21,
					endLine: 2,
					endColumn: 24,
				},
			],
		},
		{
			code: "Text text\ntext * emphasis\nemphasis emphasis\nemphasis * text\ntext text",
			output: "Text text\ntext *emphasis\nemphasis emphasis\nemphasis* text\ntext text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 6,
					endLine: 2,
					endColumn: 9,
				},
				{
					messageId: "spaceInEmphasis",
					line: 4,
					column: 8,
					endLine: 4,
					endColumn: 11,
				},
			],
		},
		{
			code: "Text ** bold\nbold ** text",
			output: "Text **bold\nbold** text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 10,
				},
				{
					messageId: "spaceInEmphasis",
					line: 2,
					column: 4,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: "Text _ **bold** _",
			output: "Text _**bold**_",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 6,
					endLine: 1,
					endColumn: 9,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "This is * italic with __ bold __ markdown *",
			output: "This is *italic with __bold__ markdown*",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 27,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 29,
					endLine: 1,
					endColumn: 33,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 41,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: "This is _\temphasized\t_ text",
			output: "This is _emphasized_ text",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "# Broken * emphasis * with spaces",
			output: "# Broken *emphasis* with spaces",
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: dedent`
				Broken * emphasis * with spaces
				===============
			`,
			output: dedent`
				Broken *emphasis* with spaces
				===============
			`,
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: dedent`
			| Table | Table                     |
			| ----- | ------------------------- |
			| star  | text * text* text          |
			| star  | text *text * text          |
			| under | text _ text_ text          |
			| under | text _text _ text          |
			`,
			output: dedent`
			| Table | Table                     |
			| ----- | ------------------------- |
			| star  | text *text* text          |
			| star  | text *text* text          |
			| under | text _text_ text          |
			| under | text _text_ text          |
			`,
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 3,
					column: 16,
					endLine: 3,
					endColumn: 19,
				},
				{
					messageId: "spaceInEmphasis",
					line: 4,
					column: 20,
					endLine: 4,
					endColumn: 23,
				},
				{
					messageId: "spaceInEmphasis",
					line: 5,
					column: 16,
					endLine: 5,
					endColumn: 19,
				},
				{
					messageId: "spaceInEmphasis",
					line: 6,
					column: 20,
					endLine: 6,
					endColumn: 23,
				},
			],
		},
		{
			code: "Broken ~ strikethrough ~ with spaces",
			output: "Broken ~strikethrough~ with spaces",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: "Broken ~~ strikethrough ~~ with spaces",
			output: "Broken ~~strikethrough~~ with spaces",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 12,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "Mixed ~~ok strikethrough~~ and ~~ broken strikethrough ~~",
			output: "Mixed ~~ok strikethrough~~ and ~~broken strikethrough~~",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 32,
					endLine: 1,
					endColumn: 36,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 54,
					endLine: 1,
					endColumn: 58,
				},
			],
		},
		{
			code: "Mixed ~ strikethrough ~ and * emphasis * with spaces",
			output: "Mixed ~strikethrough~ and *emphasis* with spaces",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 10,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 24,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 29,
					endLine: 1,
					endColumn: 32,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 38,
					endLine: 1,
					endColumn: 41,
				},
			],
		},
		{
			code: "Mixed ~ok strikethrough~ and ~ broken strikethrough ~",
			output: "Mixed ~ok strikethrough~ and ~broken strikethrough~",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 33,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 54,
				},
			],
		},
		{
			code: "# Broken ~ strikethrough ~ with spaces",
			output: "# Broken ~strikethrough~ with spaces",
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "spaceInEmphasis",
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: dedent`
			| Table | Table                     |
			| ----- | ------------------------- |
			| strike | text ~ text~ text          |
			| strike | text ~text ~ text          |
			`,
			output: dedent`
			| Table | Table                     |
			| ----- | ------------------------- |
			| strike | text ~text~ text          |
			| strike | text ~text~ text          |
			`,
			options: [{ checkStrikethrough: true }],
			errors: [
				{
					messageId: "spaceInEmphasis",
					line: 3,
					column: 17,
					endLine: 3,
					endColumn: 20,
				},
				{
					messageId: "spaceInEmphasis",
					line: 4,
					column: 21,
					endLine: 4,
					endColumn: 24,
				},
			],
		},
	],
});
