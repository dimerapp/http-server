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
const handleException = require('./src/handlers/handleException')

module.exports = function (options) {
  const router = Router()
  options = options || {}

  const env = options.NODE_ENV || 'development'

  const createServer = () => {
    router.use(require('cors')(options.cors))
    router.use(require('./src/middleware/loadStore'))
    router.param('no', require('./src/middleware/normalizeVersionNo'))

    router.get('/config.json', require('./src/routes/serveConfig'))
    router.get('/zones.json', require('./src/routes/listZones'))
    router.get('/:zone/versions.json', require('./src/routes/listVersions'))
    router.get('/:zone/versions/:no.json', require('./src/routes/listVersionTree'))
    router.get('/:zone/versions/:no/search.json', require('./src/routes/search'))
    router.get('/:zone/versions/:no/:permalink(*).json', require('./src/routes/showDoc'))

    /**
     * Serve swagger API when in development mode
     */
    if (env === 'development') {
      router.get('/', require('./src/routes/swagger'))
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
