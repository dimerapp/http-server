<div align="center">
  <div>
    <img width="500" src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1532274184/Dimer_Readme_Banner_lyy7wv.svg" alt="Dimer App">
  </div>
  <br>
  <p>
    <a href="https://dimerapp.com/what-is-dimer">
      Dimer is an open source project and CMS to help you publish your documentation online.
    </a>
  </p>
  <br>
  <p>
    <sub>We believe every project/product is incomplete without documentation. <br /> We want to help you publish user facing documentation, without worrying <code>about tools or code</code> to write.</sub>
  </p>
  <br>
</div>

# Dimer Http server
> Serve dimer datastore over HTTP server

[![travis-image]][travis-url]
[![appveyor-image]][appveyor-url]
[![npm-image]][npm-url]

This module can be used to serve Dimer datastore JSON files over HTTP server.


## Installation

```shell
npm i @dimerapp/http-server

# yarn
yarn add @dimerapp/http-server
```

## Usage

Http server needs a callback, which is used as a middleware and must attach `basePath` property to `req` object.

The `basePath` is the path where `.json` files for a website project are stored.

```js
const httpServer = require('@dimerapp/http-server')

const { router, createServer } = httpServer({
  cors: {} // https://github.com/expressjs/cors#readme
})

// This middleware is required and must set the basePath
router.use((req, res, next) => {
  req.basePath = join(__dirname, 'api')
  next()
})

createServer().listen(5000)
```

## API

#### /config.json
Returns the config for the project.

| Status code |  Response | 
|--------------|------------|
| 200 | The response will be an object of `config` |

#### /versions.json
Returns versions for the project

| Status code |  Response | 
|--------------|------------|
| 200 | The response will be an array of versions. |


#### /version/:no.json
Returns the content tree for a given version.

**You can also use the keyword `default` instead of defining the version number.**

| Status code |  Response | 
|--------------|------------|
| 200 |  An array of docs nested under categories. |
| 404 | If version doesn't exists.

#### /version/:no/:permalink.json
Returns doc content for a given permalink on a given version.

**You can also use the keyword `default` instead of defining the version number.**

| Status code |  Response | 
|--------------|------------|
| 200 |  An object containing the doc meta data and actual content in JSON format. |
| 404 | If doc doesn't exists.
| 301 | If permalink resolves as a redirect for a given doc. The returned response will have the actual permalink.


#### /search/:no.json
Search for content for a given version.

**You can also use the keyword `default` instead of defining the version number.**

| Status code |  Response | 
|--------------|------------|
| 200 |  An array of docs for the matched result ordered by their score |


## Change log

The change log can be found in the [CHANGELOG.md](https://github.com/dimerapp/http-server/CHANGELOG.md) file.

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](CONTRIBUTING.md).

## Authors & License
[thetutlage](https://github.com/thetutlage) and [contributors](https://github.com/dimerapp/http-server/graphs/contributors).

MIT License, see the included [MIT](LICENSE.md) file.

[travis-image]: https://img.shields.io/travis/dimerapp/http-server/master.svg?style=flat-square&logo=travis
[travis-url]: https://travis-ci.org/dimerapp/http-server "travis"

[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/http-server/master.svg?style=flat-square&logo=appveyor
[appveyor-url]: https://ci.appveyor.com/project/thetutlage/http-server "appveyor"

[npm-image]: https://img.shields.io/npm/v/@dimerapp/http-server.svg?style=flat-square&logo=npm
[npm-url]: https://npmjs.org/package/@dimerapp/http-server "npm"
