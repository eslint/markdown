# no-multiple-h1

Disallow multiple H1 headings in the same document.

## Background

An H1 heading is meant to define the main heading of a page, providing important structural information for both users and assistive technologies. Using more than one H1 heading per page can cause confusion for screen readers, dilute SEO signals, and break the logical content hierarchy. While modern search engines are more forgiving, best practice is to use a single H1 heading to ensure clarity and accessibility.

## Rule Details

This rule warns when it finds more than one H1 heading in a Markdown document. It checks for:

- ATX-style headings (`# Heading`)
- Setext-style headings (`Heading\n=========`)
- Front matter title fields (YAML and TOML)
- HTML h1 tags (`<h1>Heading</h1>`)

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-multiple-h1: "error" -->

# Heading 1

# Another H1 heading
```

```markdown
<!-- eslint markdown/no-multiple-h1: "error" -->

# Heading 1

Another H1 heading
==================
```

```markdown
<!-- eslint markdown/no-multiple-h1: "error" -->

<h1>First Heading</h1>

<h1>Second Heading</h1>
```

## Options

The following options are available on this rule:

* `frontmatterTitle: string` - A regex pattern to match title fields in front matter. The default pattern matches both YAML (`title:`) and TOML (`title =`) formats. Set to an empty string to disable front matter title checking.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-multiple-h1: "error" -->

---
title: My Title
---

# Heading 1
```

Examples of **incorrect** code when configured as `"no-multiple-h1": ["error", { "frontmatterTitle": "\\s*heading\\s*[:=]" }]`:

```markdown
<!-- eslint markdown/no-multiple-h1: ["error", { "frontmatterTitle": "\\s*heading\\s*[:=]" }] -->

---
heading: My Title
---

# Heading 1
```

Examples of **correct** code when configured as `"no-multiple-h1": ["error", { "frontmatterTitle": "" }]`:

```markdown
<!-- eslint markdown/no-multiple-h1: ["error", { "frontmatterTitle": "" }] -->

---
title: My Title
---

# Heading 1
```

## When Not to Use It

If you have a specific use case that requires multiple H1 headings in a single Markdown document, you can safely disable this rule. However, this is not recommended.

## Prior Art

* [MD025 - Multiple top-level headings in the same document](https://github.com/DavidAnson/markdownlint/blob/main/doc/md025.md)