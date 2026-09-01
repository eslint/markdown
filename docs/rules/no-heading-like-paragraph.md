# no-heading-like-paragraph

Disallow paragraphs that look like ATX headings.

## Background

In Markdown, an ATX heading opens with one to six hash (`#`) characters followed by a space, a tab, or a line ending, so `###### Installation` is a level 6 heading. Seven or more hash characters aren't heading syntax at all, so Markdown reads `####### Installation` as paragraph text that begins with seven literal hash characters.

This is almost always a typo, and it's easy to miss in review because the source still reads like a heading.

## Rule Details

This rule flags a line of a paragraph that begins with seven or more hash characters followed by a space, a tab, a line ending, or the end of the paragraph. It checks continuation lines as well as the first line, because six or fewer hash characters in the same position would open a real heading. Block quote markers and up to three spaces of indentation may precede the hash characters, the same positions where an ATX heading is allowed to start.

This rule ignores anything that can't open an ATX heading. `#######Installation` has no whitespace to delimit the hash characters, `\####### Installation` and `&#35;###### Installation` escape their leading hash character on purpose, and four or more spaces of indentation are too many for a heading.

This rule provides suggestions rather than an automatic fix, because the number of hash characters alone doesn't reveal which correction the author intended:

* Replace the leading hash characters with `######`, which makes the paragraph a level 6 heading. `####### Installation` becomes `###### Installation`.
* Escape the leading hash character, which leaves the rendered output unchanged. `####### Installation` becomes `\####### Installation`.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-heading-like-paragraph: "error" -->

####### Installation

######## Configuration

> ####### Usage

- ####### Options

Install the package first.
####### Installation

> foo
> ####### hi
> bar
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-heading-like-paragraph: "error" -->

###### Installation

> ###### Usage

- ###### Options

#######Configuration

\####### Not a heading

Seven ####### characters in the middle of a paragraph.

Install the package first.
###### Installation

> foo
> ###### hi
> bar
```

## Options

This rule has no options.

## When Not to Use It

If you intentionally write paragraphs that begin with seven or more hash characters, you can safely disable this rule.

## Prior Art

* [remark-lint-no-heading-like-paragraph](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-heading-like-paragraph)

## Further Reading

* [CommonMark Spec: ATX Headings](https://spec.commonmark.org/0.31.2/#atx-headings)
