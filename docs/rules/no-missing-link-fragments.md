# no-missing-link-fragments

Disallow link fragments that don't exist in the document.

## Background

Ensures that link fragments (URLs that start with `#`) reference valid headings or anchors in the document. This rule helps prevent broken internal links.

## Rule Details

This rule is triggered when a link fragment does not match any of the fragments that are automatically generated for headings in a document or explicitly defined via HTML anchors or custom heading IDs.

Examples of **incorrect** code for this rule:

```markdown
<!-- eslint markdown/no-missing-link-fragments: "error" -->

[Invalid Link](#non-existent-heading)

# Some Heading
[Case Mismatch](#SOME-HEADING) <!-- Default: case-sensitive -->
```

Examples of **correct** code for this rule:

```markdown
<!-- eslint markdown/no-missing-link-fragments: "error" -->

# Introduction
[Valid Link](#introduction)

# Another Section {#custom-id}
[Link to custom ID](#custom-id)

<p id="html-anchor">HTML Anchor</p>
[Link to HTML anchor](#html-anchor)

<a name="named-anchor">Named Anchor</a>
[Link to named anchor](#named-anchor)

[Link to top of page](#top)

<!-- With ignoreCase: true -->
<!-- eslint markdown/no-missing-link-fragments: ["error", { "ignoreCase": true }] -->
# Case Test
[Valid Link with different case](#CASE-TEST)

<!-- With allowPattern: "^figure-" -->
<!-- eslint markdown/no-missing-link-fragments: ["error", { "allowPattern": "^figure-" }] -->
[Ignored Link](#figure-123)
```

## Options

This rule supports the following options:

* `ignoreCase` (boolean, default: `false`):
    When `true`, link fragments are compared with heading and anchor IDs in a case-insensitive manner.

    ```json
    {
      "ignoreCase": true
    }
    ```

* `allowPattern` (string, default: `""`):
    A regular expression string. If a link fragment matches this pattern, it will be ignored by the rule. This is useful for fragments that are dynamically generated or handled by other tools.

    ```json
    {
      "allowPattern": "^figure-"
    }
    ```

    Example: If `allowPattern` is `"^temp-"`, links like `[Link](#temp-section)` will not be checked.

## When Not To Use It

You might consider disabling this rule if:

* You are using a Markdown processor or static site generator that has a significantly different algorithm for generating heading IDs, and this rule produces too many false positives.
* You have many dynamically generated links or fragments that cannot be easily covered by the `allowPattern` option.

## Further Reading

* [GitHub's heading anchor links](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#section-links)

## Prior Art

* [MD051 - Link fragments should be valid](https://github.com/DavidAnson/markdownlint/blob/main/doc/md051.md)
