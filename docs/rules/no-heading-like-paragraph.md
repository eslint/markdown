# no-heading-like-paragraph

Disallow paragraphs that look like ATX headings.

## Background

In Markdown, an ATX heading opens with one to six hash (`#`) characters followed by a space or a tab, so `###### Installation` is a level 6 heading. A sequence that ends the line is an empty heading, as in `######` on its own. Seven or more hash characters aren't heading syntax, so Markdown reads `####### Installation` as paragraph text that begins with seven literal hash characters.

This is almost always a typo, and it's easy to miss in review because the source still reads like a heading.

## Rule Details

This rule warns when a paragraph contains a line that looks like an ATX heading but uses seven or more hash (`#`) characters. This includes paragraphs in block quotes, list items, and footnote definitions.

This rule ignores hash characters that can't open a heading, such as `#######Installation` (no space or tab after the hash characters), `\####### Installation` (an escaped hash character), and `    ####### Installation` (four spaces of indentation at the top level). It also ignores hash characters inside a code span, a link, an image, inline HTML, or inline math.

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
