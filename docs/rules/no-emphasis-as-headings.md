# no-emphasis-as-heading

TODO

## Rule Details

This rule disallows using fully bolded paragraphs as headings. The use of fully bolded paragraphs as headings is a common anti-pattern that reduces document semantics and accessibility. Instead, proper heading elements (`#`, `##`, etc.) should be used.

### Why This Is Important

Using proper headings instead of bolded paragraphs:

- Improves document structure and semantics
- Enhances accessibility for screen readers
- Creates proper document outline
- Makes navigation of the document easier

### What This Rule Checks

This rule identifies paragraphs that:

- Consist entirely of a bold element (`**text**` or `__text__`)
- Are contained on a single line
- Are not within list items
- Have bold markup that spans the entire paragraph content

## Examples

### :x: Incorrect

Examples of **incorrect** code for this rule:

```md /**First Chapter**/ /__Second Chapter__/
<!-- eslint md/no-bold-paragraph: "error" -->

# Book

**First Chapter**

Content of the first chapter

__Second Chapter__

Content of the second chapter
```

### :white_check_mark: Correct

Examples of **correct** code for this rule:

```md
<!-- eslint md/no-bold-paragraph: "error" -->

# Book

## First Chapter

Content of the first chapter

## Second Chapter

Content of the second chapter

---

**Bold text** with normal text in the paragraph.

Text with **bold parts** is fine.

- **Bold text in a list item** is allowed.
```

## Options

No options are available for this rule.

## Prior Art

- [textlint-rule-no-bold-paragraph](https://github.com/aborazmeh/textlint-rule-no-bold-paragraph)
