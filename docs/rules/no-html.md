# no-html

Disallow HTML tags.

## Background

By default, Markdown allows you to use HTML tags mixed in with Markdown syntax. In some cases, you may want to restrict the use of HTML to ensure that the output is predictable when converting the Markdown to HTML.

## Rule Details

This rule warns when it finds HTML tags inside Markdown content.

Examples of incorrect code:

```markdown
# Heading 1

Hello <b>world!</b>
```

## Options

The following options are available on this rule:

* `allowed: Array<string>` - when specified, HTML tags are allowed only if they match one of the tags in this array.. 

Examples of incorrect code when configured as `"no-html: ["error", { allowed: ["b"]}]`:

```markdown
# Heading 1

Hello <em>world!</em>
```

Examples of correct code when configured as `"no-html: ["error", { allowed: ["b"]}]`:

```markdown
# Heading 1

Hello <b>world!</b>
```

## When Not to Use It

If you aren't concerned with empty links, you can safely disable this rule.
