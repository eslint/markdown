# no-empty-images

Disallow empty images.

## Background

In Markdown, it’s not always easy to spot when you’ve forgotten to provide a destination for an image. This is especially common when you’re writing something in Markdown and intend to insert an image, leaving the destination to fill in later, only to forget to go back and complete it. This often results in broken image links.

## Rule Details

This rule warns when it finds images that either don't have a URL specified or have only an empty fragment (`"#"`).

Examples of incorrect code:

```markdown
![]()

![ESLint Logo]()

![](#)

![Image](#)
```

## When Not to Use It

If you aren't concerned with empty images, you can safely disable this rule.

## Prior Art

* [remark-lint-no-empty-url](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-empty-url)
