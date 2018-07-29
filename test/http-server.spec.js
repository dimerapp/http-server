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

function setBasePath (req, res, next) {
  req.basePath = basePath
  next()
}

test.group('Server config', (group) => {
  group.afterEach(async () => {
    await fs.remove(basePath)
  })

  test('return 500 when basePath resolver is missing', async (assert) => {
    const { router, createServer } = httpServer()
    router.use((req, res, next) => {
      next()
    })

    const server = createServer()

    const { body } = await supertest(server).get('/config.json').expect(500)
    assert.deepEqual(body, [{ message: 'Make sure to define basePath resolver middleware' }])
    server.close()
  })

  test('return empty object when config is missing', async (assert) => {
    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/config.json').expect(200)
    assert.deepEqual(body, config)
  })

  test('return empty array when there are no versions', async (assert) => {
    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions.json').expect(200)
    assert.deepEqual(body, [])
  })

  test('return list of existing versions', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.syncVersions([{ no: '1.0.0' }])
    await datastore.persist()

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

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
    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0.json').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Foo',
          permalink: '/foo',
          category: 'root'
        }]
      }
    ])
  })

  test('return tree of docs for the default version', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.syncVersions([{ no: '1.0.0', default: false }, { no: '1.0.1', default: true }])
    await datastore.saveDoc('1.0.1', 'foo.md', {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/default.json').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Foo',
          permalink: '/foo',
          category: 'root'
        }]
      }
    ])
  })

  test('return 404 when doc not found', async (assert) => {
    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0/foo.json').expect(200)
    assert.deepEqual(body, {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo',
      category: 'root'
    })
  })

  test('return doc for the default version', async (assert) => {
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
    await datastore.syncVersions([{ no: '1.0.0', default: true }])

    await datastore.persist()

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/default/foo.json').expect(200)
    assert.deepEqual(body, {
      content: {
        type: 'root',
        children: []
      },
      title: 'Foo',
      permalink: '/foo',
      category: 'root'
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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0/bar.json').expect(301)
    assert.deepEqual(body, { redirect: '/foo' })
  })

  test('search for docs for a given version', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.saveDoc('1.0.0', 'foo.md', {
      content: {
        type: 'root',
        children: [{
          type: 'element',
          tag: 'h1',
          props: {},
          children: [{
            type: 'element',
            tag: 'p',
            props: {},
            children: [{ type: 'text', value: 'This is some great content' }]
          }]
        }]
      },
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()
    await datastore.indexVersion('1.0.0')

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/search/1.0.0.json?query=great').expect(200)
    assert.deepEqual(body[0].ref, '/foo')
  })

  test('search for docs when query has spaces', async (assert) => {
    const datastore = new Datastore(basePath)
    await datastore.load()

    await datastore.saveDoc('1.0.0', 'foo.md', {
      content: {
        type: 'root',
        children: [{
          type: 'element',
          tag: 'h1',
          props: {},
          children: [{
            type: 'element',
            tag: 'p',
            props: {},
            children: [{ type: 'text', value: 'This is some great content' }]
          }]
        }]
      },
      title: 'Foo',
      permalink: '/foo'
    })

    await datastore.persist()
    await datastore.indexVersion('1.0.0')

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/search/1.0.0.json?query=great content').expect(200)
    assert.deepEqual(body[0].ref, '/foo')
  })

  test('return tree of docs with its content', async (assert) => {
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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0.json?load_content=true').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Foo',
          permalink: '/foo',
          category: 'root',
          content: { type: 'root', children: [] }
        }]
      }
    ])
  })

  test('return tree of docs with its version', async (assert) => {
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

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0.json?load_version=true&load_content=true').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Foo',
          permalink: '/foo',
          category: 'root',
          content: { type: 'root', children: [] },
          version: {
            default: false,
            depreciated: false,
            draft: false,
            name: '1.0.0',
            no: '1.0.0'
          }
        }]
      }
    ])
  })

  test('limit docs inside tree', async (assert) => {
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

    await datastore.saveDoc('1.0.0', 'bar.md', {
      content: {
        type: 'root',
        children: []
      },
      title: 'Bar',
      permalink: '/bar'
    })

    await datastore.persist()

    const { router, createServer } = httpServer()
    router.use(setBasePath)

    const server = createServer()

    const { body } = await supertest(server).get('/versions/1.0.0.json?limit=1').expect(200)
    assert.deepEqual(body, [
      {
        category: 'root',
        docs: [{
          title: 'Bar',
          permalink: '/bar',
          category: 'root'
        }]
      }
    ])
  })
})
