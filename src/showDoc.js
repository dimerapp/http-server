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
  const redirected = req.store.redirectedPermalink(req.params.no, req.params.permalink)
  /**
   * If permalink is resolved as a redirect, then redirect it to that
   * doc
   */
  if (redirected) {
    nodeRes.status(res, 301)
    nodeRes.send(req, res, { redirect: redirected })
    return
  }

  /**
   * Find for the doc for a given permalink
   *
   * @type {Object}
   */
  const doc = await req.store.getDocByPermalink(req.params.no, req.params.permalink)

  /**
   * If unable to find doc, then return 404
   */
  if (!doc) {
    nodeRes.status(res, 404)
    nodeRes.send(req, res, [{ message: 'doc not found' }])
    return
  }

  /**
   * Otherwise return 200 with the doc contents
   */
  nodeRes.status(res, 200)
  nodeRes.send(req, res, doc)
}