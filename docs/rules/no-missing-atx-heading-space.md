# no-missing-atx-heading-space

This rule warns when spaces are missing after the hash characters in an ATX style heading.

## Rule Details

In Markdown, headings can be created using ATX style (using hash (`#`) characters at the beginning of the line) or Setext style (using underlining with equals (`=`) or hyphens (`-`)).

For ATX style headings, a space should be used after the hash characters to improve readability and ensure proper rendering across various Markdown parsers.

This rule is automatically fixable by the `--fix` command line option.

Examples of **incorrect** code for this rule:

```md
<!-- eslint markdown/no-missing-atx-heading-space: "error" -->

#Heading 1
##Heading 2
###Heading 3
```

Examples of **correct** code for this rule:

```md
<!-- eslint markdown/no-missing-atx-heading-space: "error" -->

# Heading 1
## Heading 2
### Heading 3

<h1>#Some Heading</h1>

[#123](link.com)

![#alttext][link.png]

This is a paragraph with a #hashtag, not a heading.
```

## Options

The following options are available on this rule:

* `checkClosedHeadings: boolean` - When set to `true`, the rule will also check for missing spaces before closing hash characters in ATX headings. (default: `false`)

Examples of **incorrect** code when configured as `"no-missing-atx-heading-space": ["error", { checkClosedHeadings: true }]`:

```markdown
<!-- eslint markdown/no-missing-atx-heading-space: ["error", { checkClosedHeadings: true }] -->

# Heading 1#
## Heading 2##
### Heading 3###
```

Examples of **correct** code when configured as `"no-missing-atx-heading-space": ["error", { checkClosedHeadings: true }]`:

```markdown
<!-- eslint markdown/no-missing-atx-heading-space: ["error", { checkClosedHeadings: true }] -->

# Heading 1 #
## Heading 2 ##
### Heading 3 ###
```

## When Not To Use It

You might want to turn this rule off if you're working with a Markdown variant that doesn't require spaces after hash characters in headings.

## Prior Art

- [MD018 - No space after hash on atx style heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md018.md)
- [MD020 - No space inside hashes on closed atx style heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md020.md)

## Further Reading

- [Markdown Syntax: Headings](https://daringfireball.net/projects/markdown/syntax#header)
- [CommonMark Spec: ATX Headings](https://spec.commonmark.org/0.30/#atx-headings) 