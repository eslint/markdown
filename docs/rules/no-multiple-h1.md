# no-multiple-h1

Disallow multiple h1 headings in the same document.

## Background

An h1 heading is meant to define the main heading of a page, providing important structural information for both users and assistive technologies. Using more than one h1 heading per page can cause confusion for screen readers, dilute SEO signals, and break the logical content hierarchy. While modern search engines are more forgiving, best practice is to use a single h1 heading to ensure clarity and accessibility.

## Rule Details

This rule warns when it finds more than one h1 heading in a Markdown document. It checks for:

- ATX-style headings (`# Heading`)
- Setext-style headings (`Heading\n=========`)
- Front matter title fields (YAML and TOML)
- HTML h1 tags (`<h1>Heading</h1>`)

Examples of incorrect code:

```markdown
# Heading 1

# Another h1 heading
```

```markdown
# Heading 1

Another h1 heading
==================
```

```markdown
---
title: My Title
---

# Heading 1
```

```markdown
<h1>First Heading</h1>

<h1>Second Heading</h1>
```

## Options

The following options are available on this rule:

* `frontmatterTitle: string` - A regex pattern to match title fields in front matter. The default pattern matches both YAML (`title:`) and TOML (`title =`) formats. Set to empty string to disable front matter title checking.

Examples of incorrect code when configured as `"no-multiple-h1": ["error", { "frontmatterTitle": "\\s*heading\\s*[:=]" }]`:

```markdown
---
heading: My Title
---

# Heading 1
```

Examples of correct code when configured as `"no-multiple-h1": ["error", { "frontmatterTitle": "" }]`:

```markdown
---
title: My Title
---

# Heading 1
```

## When Not to Use It

If you have a specific use case that requires multiple h1 headings in a single Markdown document, you can safely disable this rule. However, this is rarely recommended.

## Prior Art

* [MD025 - Multiple top-level headings in the same document](https://github.com/DavidAnson/markdownlint/blob/main/doc/md025.md)