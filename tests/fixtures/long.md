# Test

```txt
Don't lint me!
```

This is some code:

```js
console.log(42);
```

```js
// Comment
function foo() {
    console.log("Hello");
}
```

<!-- eslint-env node -->
<!-- eslint-disable eol-last, quotes -->

```js
console.log(process.version);
```

How about some JSX?

<!--
    eslint quotes: [
        "error",
        "single"
    ]
-->
<!--eslint-disable no-console-->

```js
console.log("Error!");
```

    I may be a code block, but don't lint me!

<!-- eslint-disable -->

```js
!@#$%^&*()
```

The end.
