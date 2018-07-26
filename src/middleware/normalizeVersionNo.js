/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

module.exports = function (req, res, next, no) {
  if (no === 'default') {
    const defaultVersion = req.store.getVersions().find((version) => version.default)
    if (defaultVersion) {
      req.params.no = defaultVersion.no
    }
  }

  next()
}
