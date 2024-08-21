# React Example

```jsx
function App({ name }) {
    return (
        <div>
            <p>Hello, {name}!</p>
        </div>
    );
}
```

```sh
$ git clone https://github.com/eslint/markdown.git
$ cd markdown
$ npm install
$ cd examples/react
$ npm test

markdown/examples/react/README.md
  4:16  error  'name' is missing in props validation  react/prop-types

✖ 1 problem (1 error, 0 warnings)
```
