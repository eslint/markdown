# no-empty-alt-text

Disallow images without an alternative text.

## Background

Providing alternative text for images is essential for accessibility. Without alternative text, users who rely on screen readers or other assistive technologies won't be able to understand the content of images. This rule helps catch cases where alternative text is missing or contains only whitespace.

## Rule Details

This rule warns when it finds images that either don't have alternative text or have only whitespace as alternative text.

Examples of incorrect code:

```markdown
![](sunset.png)

![ ](sunset.png)

![][ref]

[ref]: sunset.png
```

Examples of correct code:

```markdown
![A beautiful sunset](sunset.png)

![Company logo][logo]

[logo]: logo.png
```

## When Not to Use It

If you aren't concerned with image accessibility or if your images are purely decorative and don't convey meaningful content, you can safely disable this rule.

## Prior Art

* [MD045 - Images should have alternate text (alt text)](https://github.com/DavidAnson/markdownlint/blob/main/doc/md045.md)