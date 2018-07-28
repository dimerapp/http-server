/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const nodeRes = require('node-res')
const nodeReq = require('node-req')

module.exports = async function (req, res) {
  const queryString = nodeReq.get(req)

  if (!queryString.query) {
    nodeRes.status(res, 200)
    nodeRes.send(req, res, [], false)
    return
  }

  const results = await req.store.search(req.params.no, queryString.query)
  nodeRes.status(res, 200)
  nodeRes.send(req, res, results, false)
}
