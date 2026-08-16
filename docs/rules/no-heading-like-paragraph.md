# no-heading-like-paragraph

Disallow paragraphs that look like ATX headings.

## Background

In Markdown, an ATX heading opens with one to six hash (`#`) characters followed by a space or a tab, so `###### Installation` is a level 6 heading. A seventh hash character exceeds the maximum heading depth, and `####### Installation` doesn't create a heading at all. Markdown renders it as a paragraph whose text starts with seven literal hash characters.

This is almost always a typo, and it's easy to miss in review because the source still reads like a heading.

## Rule Details

This rule flags a paragraph that begins with seven or more hash characters followed by a space, a tab, a line ending, or the end of the paragraph.

This rule ignores anything that can't open an ATX heading. `#######Installation` has no whitespace to delimit the hash characters, and `\####### Installation` and `&#35;###### Installation` escape their leading hash character on purpose.

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
```

This rule only checks the beginning of a paragraph, so it ignores hash characters on a continuation line:

```markdown
Install the package first.
####### Installation
```

Because `####### Installation` can't start a heading, Markdown folds it into the preceding paragraph as a lazy continuation line. The same text with six or fewer hash characters would interrupt the paragraph and become a real heading.

## When Not to Use It

If you intentionally write paragraphs that begin with seven or more hash characters, you can safely disable this rule.

## Prior Art

* [remark-lint-no-heading-like-paragraph](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-heading-like-paragraph)

## Further Reading

* [CommonMark Spec: ATX Headings](https://spec.commonmark.org/0.31.2/#atx-headings)
