/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

module.exports = function (req, res, next, no) {
  const versions = req.store.getVersions(req.params.zone)
  if (!versions) {
    const error = new Error('Zone not found')
    error.status = 404
    throw error
  }

  if (no === 'default') {
    const defaultVersion = versions.find((version) => version.default)
    if (defaultVersion) {
      req.params.no = defaultVersion.no
    }
  }

  next()
}
