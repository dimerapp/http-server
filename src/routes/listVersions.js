/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const nodeRes = require('node-res')

module.exports = function (req, res) {
  try {
    const versions = req.store.getVersions(req.params.zone)
    if (!versions) {
      nodeRes.status(res, 404)
      nodeRes.send(req, res, [{ message: 'zone not found' }], false)
      return
    }

    nodeRes.send(req, res, versions, false)
  } catch (error) {
    console.log(error)
  }
}
