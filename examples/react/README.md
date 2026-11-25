# React Example

```jsx
function App({ names }) {
    return (
        <div>
            {names.map(name => <p>Hello, {name}!</p>)}
        </div>
    );
}
```

## Running the Example

### Clone Repository and Install Dependencies

```sh
$ git clone https://github.com/eslint/markdown.git
$ cd markdown
$ npm install
```

### Run ESLint

```sh
# Run from the root
$ npm test -w examples/react
```

Or

```sh
# Navigate to the directory and run
$ cd examples/react
$ npm test
```

### Expected Output

```sh
markdown/examples/react/README.md
  7:32  error  Missing 'key' for element when rendering list  @eslint-react/no-missing-key

✖ 1 problem (1 error, 0 warnings)
```
