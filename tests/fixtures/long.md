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

<!-- global process -->
<!-- eslint-disable yoda, dot-notation -->

```js
console.log("linux" === process["platform"]);
```

How about some JSX?

<!--
    eslint yoda: [
        "error",
        "always"
    ]
-->
<!--eslint-disable no-console-->

```js
console.log(window.length === 0);
```

    I may be a code block, but don't lint me!

<!-- eslint-disable -->

```js
!@#$%^&*()
```

The end.
