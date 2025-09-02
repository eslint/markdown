# heading-increment

Enforce heading levels increment by one.

## Background

It can be difficult to keep track of the correct heading levels in a long document. Most of the time, you want to increment heading levels by one, so inside of a heading level 1 you'll have one or more heading level 2s. If you've skipped from, for example, heading level 1 to heading level 3, that is most likely an error.

## Rule Details

This rule warns when it finds a heading that is more than one level higher than the preceding heading.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/heading-increment: "error" -->

# Hello world!

### Hello world!

Goodbye World!
--------------

#EEE Goodbye World!
```

## Options

The following options are available on this rule:

* `frontmatterTitle: string` - A regex pattern to match title fields in front matter. Front matter titles matching this pattern are treated as level 1 headings. The default pattern matches YAML (`title:`), TOML (`title =`), and JSON (`"title":`) formats. Set to an empty string to disable front matter title checking.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/heading-increment: "error" -->

---
title: My Title
---

### Heading 3 with YAML front matter
```

```markdown
<!-- eslint markdown/heading-increment: "error" -->

+++
title = "My Title"
+++

### Heading 3 with TOML front matter
```

```markdown
<!-- eslint markdown/heading-increment: "error" -->

---
{ "title": "My Title" }
---

### Heading 3 with JSON front matter
```

Examples of **incorrect** code when configured as `"heading-increment": ["error", { frontmatterTitle: "\\s*heading\\s*[:=]" }]`:

```markdown
<!-- eslint markdown/heading-increment: ["error", { frontmatterTitle: "\\s*heading\\s*[:=]" }] -->

---
heading: My Title
---

### Heading 3
```

Examples of **correct** code when configured as `"heading-increment": ["error", { frontmatterTitle: "" }]`:

```markdown
<!-- eslint markdown/heading-increment: ["error", { frontmatterTitle: "" }] -->

---
title: My Title
---

### Heading 3
```

## When Not to Use It

If you aren't concerned with enforcing heading levels increment by one, you can safely disable this rule.

## Prior Art

* [MD001 - Header levels should only increment by one level at a time](https://github.com/markdownlint/markdownlint/blob/main/docs/RULES.md#md001---header-levels-should-only-increment-by-one-level-at-a-time)
* [MD001 - heading-increment](https://github.com/DavidAnson/markdownlint/blob/main/doc/md001.md)
