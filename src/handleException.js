/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const nodeRes = require('node-res')

module.exports = function (error, req, res) {
  if (error) {
    nodeRes.status(res, error.status || 500)
    nodeRes.send(req, res, [{ message: error.message }])
    return
  }

  /**
   * If error is empty then it is 404 not found
   */
  nodeRes.status(res, 404)
  nodeRes.send(req, res, [{ message: 'route not found' }])
}
