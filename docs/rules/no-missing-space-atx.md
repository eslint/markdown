# no-missing-space-atx

This rule warns when spaces are missing after the hash characters in an ATX style heading.

## Rule Details

In Markdown, headings can be created using ATX style (using hash (`#`) characters at the beginning of the line) or Setext style (using underlining with equals (`=`) or hyphens (`-`).

For ATX style headings, a space should be used after the hash characters to improve readability and ensure proper rendering across various Markdown parsers.

This rule is automatically fixable by the `--fix` command line option.

Examples of **incorrect** code for this rule:

```md
#Heading 1
##Heading 2
###Heading 3
```

Examples of **correct** code for this rule:

```md
# Heading 1
## Heading 2
### Heading 3
```

Lines that contain hash characters but are not headings (not at the beginning of the line) will not be flagged:

```md
This is a paragraph with a #hashtag, not a heading.
```

## When Not To Use It

You might want to turn this rule off if you're working with a Markdown variant that doesn't require spaces after hash characters in headings.

## Prior Art

[MD018 - No space after hash on atx style heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md018.md)

## Further Reading

- [Markdown Syntax: Headings](https://daringfireball.net/projects/markdown/syntax#header)
- [CommonMark Spec: ATX Headings](https://spec.commonmark.org/0.30/#atx-headings) 