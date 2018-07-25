/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const nodeRes = require('node-res')

module.exports = async function (req, res) {
  nodeRes.status(res, 200)
  nodeRes.send(req, res, req.store.getConfig())
}
