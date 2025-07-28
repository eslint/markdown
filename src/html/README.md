### Features

- Tiny, fault-tolerant and friendly HTML-like parser. Works with HTML, Astro, Vue, Svelte, and any other HTML-like syntax.
- Built-in AST `walk` utility
- `querySelector` and `querySelectorAll` support using `ultrahtml/selector`

#### `walk`

The `walk` function provides full control over the AST. It can be used to scan for text, elements, components, or any other validation you might want to do.

> **Note** > `walk` is `async` and **must** be `await`ed. Use `walkSync` if it is guaranteed there are no `async` components in the tree.

```js
import { parse, walk, ELEMENT_NODE } from "ultrahtml";

const ast = parse(`<h1>Hello world!</h1>`);
await walk(ast, async (node) => {
  if (node.type === ELEMENT_NODE && node.name === "script") {
    throw new Error("Found a script!");
  }
});
```

#### `walkSync`

The `walkSync` function is identical to the `walk` function, but is synchronous. This should only be used when it is guaranteed there are no `async` components in the tree.

```js
import { parse, walkSync, ELEMENT_NODE } from "ultrahtml";

const ast = parse(`<h1>Hello world!</h1>`);
walkSync(ast, (node) => {
  if (node.type === ELEMENT_NODE && node.name === "script") {
    throw new Error("Found a script!");
  }
});
```

#### `renderSync`

The `renderSync` function allows you to serialize an AST back into a string.

> **Note**
> By default, `renderSync` will sanitize your markup, removing any `script` tags. Pass `{ sanitize: false }` to disable this behavior.

```js
import { parse, renderSync } from "ultrahtml";

const ast = parse(`<h1>Hello world!</h1>`);
console.log(renderSync(ast)); // <h1>Hello world!</h1>
```

## Acknowledgements

- [Jason Miller](https://twitter.com/_developit)'s [`htmlParser`](https://github.com/developit/htmlParser) provided a great, lightweight base for this parser
- [Titus Wormer](https://twitter.com/wooorm)'s [`mdx`](https://mdxjs.com) for inspiration
