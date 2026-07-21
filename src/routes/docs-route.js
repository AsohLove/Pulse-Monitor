import { readFileSync } from 'node:fs'
import YAML from 'yaml'
import swaggerUi from 'swagger-ui-express'

const specUrl = new URL('../../docs/openapi.yaml', import.meta.url)
const specText = readFileSync(specUrl, 'utf8')
const spec = YAML.parse(specText)

export function mountDocs (app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec))
  app.get('/openapi.yaml', (req, res) => {
    res.type('text/yaml').send(specText)
  })
}
