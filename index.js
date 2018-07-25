/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const Router = require('router')
const http = require('http')
const handleException = require('./src/handleException')

module.exports = function (resolveBaseDir) {
  const router = Router()
  router.param('no', require('./src/middleware/normalizeVersionNo'))

  router.use(resolveBaseDir)
  router.use(require('./src/middleware/loadStore'))

  router.get('/config.json', require('./src/serveConfig'))
  router.get('/versions.json', require('./src/listVersions'))
  router.get('/versions/:no.json', require('./src/listVersionTree'))
  router.get('/versions/:no/:permalink.json', require('./src/showDoc'))

  return http.createServer((req, res) => {
    router(req, res, (error) => {
      handleException(error, req, res)
    })
  })
}
