/*
* http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

const nodeRes = require('node-res')
const swagger = require('../../swagger.json')

module.exports = async function (req, res) {
  const spec = Object.assign(swagger, { host: req.headers.host })
  nodeRes.send(req, res, `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui.css">
</head>
<body>
  <div id="ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.12.1/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        dom_id: '#ui',
        spec: ${JSON.stringify(spec)}
      })
    }
  </script>
</body>
</html>`)
}
