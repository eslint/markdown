# no-space-in-emphasis

Disallow spaces around emphasis markers.

## Background

In Markdown, emphasis (bold and italic) is created using asterisks (`*`) or underscores (`_`), and a strikethrough is created using tildes (`~`). The emphasis markers must be directly adjacent to the text they're emphasizing, with no spaces between the markers and the text. When spaces are present, the emphasis is not rendered correctly.

Please note that this rule does not check for spaces inside emphasis markers when the content is itself an emphasis (i.e., nested emphasis). For example, `**_ bold _**` and `_** italic **_` are not flagged, even though there are spaces inside the inner emphasis markers.

## Rule Details

This rule warns when it finds emphasis markers that have spaces between the markers and the text they're emphasizing.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-space-in-emphasis: "error" -->

Here is some ** bold ** text.
Here is some * italic * text.
Here is some __ bold __ text.
Here is some _ italic _ text.
Here is some *** bold italic *** text.
Here is some ___ bold italic ___ text.
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-space-in-emphasis: "error" -->

Here is some **bold** text.
Here is some *italic* text.
Here is some __bold__ text.
Here is some _italic_ text.
Here is some ***bold italic*** text.
Here is some ___bold italic___ text.
Here is some **_ bold _** text.
Here is some _** italic **_ text.
```

## Options

The following options are available on this rule:

* `checkStrikethrough: boolean` - when `true`, also check for spaces around strikethrough markers (`~` and `~~`). (default: `false`)

> [!IMPORTANT] <!-- eslint-disable-line -- This should be fixed in https://github.com/eslint/markdown/issues/294 -->
>
> Use `checkStrikethrough` with `language: "markdown/gfm"`; in CommonMark, `~`/`~~` aren’t strikethrough (they’ll still be linted if enabled).

Examples of **incorrect** code when configured as `"no-space-in-emphasis": ["error", { checkStrikethrough: true }]`:

```markdown
<!-- eslint markdown/no-space-in-emphasis: ["error", { checkStrikethrough: true }] -->

Here is some ~ strikethrough ~ text.
Here is some ~~ strikethrough ~~ text.
```

Examples of **correct** code when configured as `"no-space-in-emphasis": ["error", { checkStrikethrough: true }]`:

```markdown
<!-- eslint markdown/no-space-in-emphasis: ["error", { checkStrikethrough: true }] -->

Here is some ~strikethrough~ text.
Here is some ~~strikethrough~~ text.
```

## When Not to Use It

If you aren't concerned with proper emphasis rendering in your Markdown documents, you can safely disable this rule.

## Prior Art

* [MD037 - Spaces inside emphasis markers](https://github.com/DavidAnson/markdownlint/blob/main/doc/md037.md)