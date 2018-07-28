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
  const tree = await req.store.getTree(req.params.no)

  /**
   * Return 404 when unable to locate tree for the version.
   */
  if (!tree) {
    nodeRes.status(res, 404)
    nodeRes.send(req, res, [{ message: 'version not found' }], false)
    return
  }

  /**
   * Otherwise return the tree
   */
  nodeRes.status(res, 200)
  nodeRes.send(req, res, tree, false)
}
