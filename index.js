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

module.exports = function (options) {
  const router = Router()
  options = options || {}

  const env = options.NODE_ENV || 'development'

  const createServer = () => {
    router.use(require('cors')(options.cors))
    router.use(require('./src/middleware/loadStore'))
    router.param('no', require('./src/middleware/normalizeVersionNo'))
    router.get('/config.json', require('./src/serveConfig'))
    router.get('/versions.json', require('./src/listVersions'))
    router.get('/versions/:no.json', require('./src/listVersionTree'))
    router.get('/versions/:no/:permalink.json', require('./src/showDoc'))
    router.get('/search/:no.json', require('./src/search'))

    /**
     * Serve swagger API when in development mode
     */
    if (env === 'development') {
      router.get('/', require('./src/swagger'))
    }

    return http.createServer((req, res) => {
      router(req, res, (error) => {
        handleException(error, req, res)
      })
    })
  }

  return {
    router,
    createServer
  }
}
