# totkeks' tslint rules

Additional [TSLint](https://github.com/palantir/tslint) rules I thought were missing, so I built them.

## Installation

```shell
npm install --save-dev @totkeks/tslint-rules
```

## Configuration

Add `node_modules/@totkeks/tslint-rules` to the `rules_directory` array in your tslint configuration file - either `tslint.yaml` or `tslint.json`.

## Supported Rules

| Rule Name             | Description                                                   | Since |
|-----------------------|---------------------------------------------------------------|-------|
| newline-after-imports | Requires a certain number of newlines after the import block. | 0.1.0 |

## License

MIT
