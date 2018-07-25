/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const Datastore = require('@dimerapp/datastore')

module.exports = async function (req, res, next) {
  if (!req.basePath) {
    next(new Error('Make sure to define basePath resolver middleware'))
    return
  }

  const store = new Datastore(req.basePath)
  await store.load()

  req.store = store
  next()
}
