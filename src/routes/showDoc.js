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
  const { load_version: loadVersion } = nodeReq.get(req)
  const { permalink, zone, no } = req.params

  /**
   * If permalink is resolved as a redirect, then redirect it to that
   * doc
   */
  const redirected = req.store.redirectedPermalink(zone, no, permalink)
  if (redirected) {
    nodeRes.status(res, 301)
    nodeRes.send(req, res, { redirect: redirected }, false)
    return
  }

  /**
   * Find for the doc for a given permalink
   *
   * @type {Object}
   */
  const doc = await req.store.getDocByPermalink(zone, no, permalink, loadVersion)

  /**
   * If unable to find doc, then return 404
   */
  if (!doc) {
    nodeRes.status(res, 404)
    nodeRes.send(req, res, [{ message: 'doc not found' }], false)
    return
  }

  /**
   * Otherwise return 200 with the doc contents
   */
  nodeRes.status(res, 200)
  nodeRes.send(req, res, doc, false)
}
