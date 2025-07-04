# no-space-in-emphasis

Disallow spaces around emphasis markers.

## Background

In Markdown, emphasis (bold and italic) is created using asterisks (`*`) or underscores (`_`), and a strikethrough is created using tildes (`~`). The emphasis markers must be directly adjacent to the text they're emphasizing, with no spaces between the markers and the text. When spaces are present, the emphasis is not rendered correctly.

## Rule Details

This rule warns when it finds emphasis markers that have spaces between the markers and the text they're emphasizing.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-space-in-emphasis: "error" -->

Here is some ** bold ** text.
Here is some * italic * text.
Here is some __ bold __ text.
Here is some _ italic _ text.
Here is some ~~ strikethrough ~~ text.
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-space-in-emphasis: "error" -->

Here is some **bold** text.
Here is some *italic* text.
Here is some __bold__ text.
Here is some _italic_ text.
Here is some ~~strikethrough~~ text.
```

## When Not to Use It

If you aren't concerned with proper emphasis rendering in your Markdown documents, you can safely disable this rule.

## Prior Art

* [MD037 - Spaces inside emphasis markers](https://github.com/DavidAnson/markdownlint/blob/main/doc/md037.md)