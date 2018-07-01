# go-cli [![npm](https://img.shields.io/npm/v/go-cli.svg?style=flat-square)](https://www.npmjs.com/package/go-cli) [![Travis](https://img.shields.io/travis/gocli/go-cli.svg?style=flat-square)](https://travis-ci.org/gocli/go-cli) [![Coveralls](https://img.shields.io/coveralls/github/gocli/go-cli.svg?style=flat-square)](https://coveralls.io/github/gocli/go-cli)

The CLI tool to use boilerplates made with [go](https://www.npmjs.com/package/go)

![go-cli example](https://raw.githubusercontent.com/gocli/go-cli/master/docs/example.gif)

## Usage

This tool can be used for two purposes:

1. To setup boilerplate

   ```bash
   $ npm install -g go-cli
   $ go git https://github.com/repo/name.git app/path
   ```

2. And to execute locally-defined commands
   ```bash
   $ cd app/path
   $ go script-name
   ```

## Loaders

Go CLI is using **loaders** to setup boilerplates. They can be installed via npm:

```bash
$ npm install -g go-loader-git
```

[`go-loader-git`](https://npmjs.org/package/go-loader-git) allows you to install boilerplates from git repositories and it is bundled with go-cli, so there is no need to install it separately.

The command `go <loader-name>` will execute the loader with given arguments.

```bash
$ go <loader-name>[:suffix] [options & flags]
```

If you will find a need to build your own loader check out the section [Creating your own loader](#creating-your-own-loader).

### Git Shortcuts

When using git links git-loader name can be avoided:

```bash
$ go git@github.com:repo/name.git
# instead
$ go git git@github.com:repo/name.git
```

```bash
$ go https://github.com/repo/name.git
# instead
$ go git https://github.com/repo/name.git
```

## Boilerplates

> Note: A structure and location of boilerplates may vary depending on the loader that is used to load them.

The boilerplate is basically a folder that may contain `.goconfig` and/or `gofile.js`.

### .goconfig(.json)

> if extension is not specified, then file will be interpreted as JavaScirpt

This file will be required when loader will finish its work. And then the command from the option `install` will be evaluated.

```json
{
  "install": "npm install && go install"
}
```

The flag `--no-install` can be used to prevent running `install` command:

```bash
$ go git repo/name --no-install
```

### gofile.js

This file is used to define commands that can be executed from shell. To define them you will need [go](https://npmjs.org/package/go) package installed.

```js
// gofile.js
const go = require('go')
go.registerCommand('ping', () => console.log('pong'))
```

```bash
# in the boilerplate folder
$ go ping
pong
```

Read more about [go capabilities](https://npmjs.org/package/go) to get more out of it.

## Creating your own loader

The loader is an npm package that resolves with a function or an object. The resolved function, or the option `install` of a resolved object will be called with arguments from CLI command parsed with [minimist](https://www.npmjs.com/package/minimist).

The name of the loader package is very important as it will result in the loader command name. It should start with `go-loader-` and followed by the name that will be used to trigger the loader. So if the loader is named `go-loader-file` the command `go file` will trigger it.

Here is an example of call to `go-loader-file`:

```bash
$ go file:path/to/file target --option value -s
```

Go CLI will try to resolve `go-loader-file` in `npm` and `yarn` modules folders and call it with `commandString` and `argv` (parsed command) arguments:

```js
// loader
function fileLoader (argv, suffix) {
  /*
   * commandString = 'file:path/to/file target --option value -s'
   * argv = {
   *   _: [ 'file', 'path/to/file', 'target' ],
   *   option: 'value',
   *   s: true
   * }
   */
}

module.exports = fileLoader
// or
module.exports.install = fileLoader
```

## License

MIT © [Stanislav Termosa](https://github.com/termosa)

