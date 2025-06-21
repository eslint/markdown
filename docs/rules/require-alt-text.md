# require-alt-text

Require alternative text for images.

## Background

Providing alternative text for images is essential for accessibility. Without alternative text, users who rely on screen readers or other assistive technologies won't be able to understand the content of images. This rule helps catch cases where alternative text is missing or contains only whitespace.

## Rule Details

This rule warns when it finds images that either don't have alternative text or have only whitespace as alternative text.

This rule does not warn when:
- An HTML image has an empty alt attribute (`alt=""`)
- An HTML image has the `aria-hidden="true"` attribute

Examples of **incorrect** code:

```markdown
<!-- eslint markdown/require-alt-text: "error" -->

![](sunset.png)

![ ](sunset.png)

![][ref]

[ref]: sunset.png

<img src="sunset.png">

<img src="sunset.png" alt=" ">
```

Examples of **correct** code:

```markdown
<!-- eslint markdown/require-alt-text: "error" -->

![A beautiful sunset](sunset.png)

![Company logo][logo]

[logo]: logo.png

<img src="sunset.png" alt="">

<img src="sunset.png" alt="A beautiful sunset">

<img src="decorative.png" aria-hidden="true">
```

## When Not to Use It

If you aren't concerned with image accessibility or if your images are purely decorative and don't convey meaningful content, you can safely disable this rule.

## Prior Art

* [MD045 - Images should have alternate text (alt text)](https://github.com/DavidAnson/markdownlint/blob/main/doc/md045.md)