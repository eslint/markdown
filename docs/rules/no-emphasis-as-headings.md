# no-emphasis-as-headings

Disallow using emphasis or strong text as headings.

## Background

Authors sometimes use a paragraph containing only italic or bold text to visually separate sections. Although this may look like a heading, Markdown processors treat it as a paragraph. As a result, tools such as screen readers, document outline generators, and table-of-contents generators cannot recognize it as part of the document structure.

Use a Markdown heading when text introduces a section, and reserve emphasis and strong text for content within a paragraph.

## Rule Details

This rule warns when a single-line paragraph consists entirely of emphasized (`*text*` or `_text_`) or strong (`**text**` or `__text__`) content. Combined emphasis and strong content, such as `***text***`, is also reported.

The rule does not warn when:

- The emphasized text ends with a configured punctuation character
- The paragraph spans multiple lines
- The emphasis is only part of a paragraph
- The emphasis appears inside a blockquote, list item, footnote definition, heading, or GFM table cell

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-emphasis-as-headings: "error" -->

# Planetary guide

**Inner planets**

Mercury, Venus, Earth, and Mars are the inner planets.

_Outer planets_

Jupiter, Saturn, Uranus, and Neptune are the outer planets.

***Dwarf planets***

Pluto is classified as a dwarf planet.
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-emphasis-as-headings: "error" -->

# Planetary guide

## Inner planets

Mercury, Venus, Earth, and Mars are the inner planets.

**Mercury** is the closest planet to the Sun.

*Is Pluto a planet?*

> **Note**
>
> Pluto is classified as a dwarf planet.

- **Inner planets**: Mercury, Venus, Earth, and Mars
```

## Options

The following option is available on this rule:

- `punctuation: Array<string>` - Characters that may end a fully emphasized paragraph without triggering a warning. Each array item must be a single, unique character. The default is `[".", ",", ";", ":", "!", "?", "。", "，", "；", "：", "！", "？"]`.

Examples of **correct** code for this rule with `punctuation: [")"]`:

```markdown
<!-- eslint markdown/no-emphasis-as-headings: ["error", { punctuation: [")"] }] -->

*Appendix A)*
```

## When Not to Use It

If standalone emphasized paragraphs are an intentional part of your document style and you do not need them represented in the document outline, you can safely disable this rule.

## Prior Art

- [MD036 - Emphasis used instead of a heading](https://github.com/DavidAnson/markdownlint/blob/main/doc/md036.md#md036---emphasis-used-instead-of-a-heading)
- [remark-lint-no-emphasis-as-heading](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-emphasis-as-heading#remark-lint-no-emphasis-as-heading)
