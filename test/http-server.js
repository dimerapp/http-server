/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const test = require('japa')
const { join } = require('path')
const fs = require('fs-extra')
const supertest = require('supertest')
const httpServer = require('..')
const Datastore = require('@dimerapp/datastore')

const basePath = join(__dirname, 'app')

test.group('Server config', (group) => {
  group.afterEach(async () => {
    await fs.remove(basePath)
  })

  test('return 500 when basePath resolver is missing', async (assert) => {
    const server = httpServer((req, res, next) => {
      next()
    })

    const { body } = await supertest(server).get('/config.json').expect(500)
    assert.deepEqual(body, [{ message: 'Make sure to define basePath resolver middleware' }])
    server.close()
  })

  test('return empty object when config is missing', async (assert) => {
    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/config.json').expect(200)
    assert.deepEqual(body, {})
  })

  test('return config when it exists', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    const config = {
      domain: 'foo.com',
      options: {
        headerBg: '#fff'
      }
    }

    await datastore.syncConfig(config)
    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/config.json').expect(200)
    assert.deepEqual(body, config)
  })

  test('return empty array when there are no versions', async (assert) => {
    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions.json').expect(200)
    assert.deepEqual(body, [])
  })

  test('return list of existing versions', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.syncVersions([{ no: '1.0.0' }])
    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions.json').expect(200)
    assert.deepEqual(body, [{
      no: '1.0.0',
      default: false,
      depreciated: false,
      draft: false,
      heroDoc: null,
      name: '1.0.0'
    }])
  })

  test('return 404 when version doesn\'t exists', async (assert) => {
    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0.json').expect(404)
    assert.deepEqual(body, [{
      message: 'version not found'
    }])
  })

  test('return empty array when there are no docs in the tree', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.syncVersions([{ no: '1.0.0' }])
    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0.json').expect(200)
    assert.deepEqual(body, [])
  })

  test('return tree of docs', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.saveDoc('1.0.0', 'foo.md', {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0.json').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Foo',
          permalink: '/foo',
          jsonPath: 'foo.json',
          category: 'root'
        }]
      }
    ])
  })

  test('return 404 when doc not found', async (assert) => {
    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0/hello.json').expect(404)
    assert.deepEqual(body, [{ message: 'doc not found' }])
  })

  test('return doc content when found', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.saveDoc('1.0.0', 'foo.md', {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0/foo.json').expect(200)
    assert.deepEqual(body, {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo',
      category: 'root',
      jsonPath: 'foo.json'
    })
  })

  test('redirect request when route is part of redirects', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.saveDoc('1.0.0', 'foo.md', {
      content: {
        type: 'root',
        children: []
      },
      redirects: ['bar'],
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()

    const server = httpServer((req, res, next) => {
      req.basePath = basePath
      next()
    })

    const { body } = await supertest(server).get('/versions/1.0.0/bar.json').expect(301)
    assert.deepEqual(body, { redirect: '/foo' })
  })
})
