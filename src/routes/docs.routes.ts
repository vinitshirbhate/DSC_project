import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import { swaggerConfig } from '../utils/swagger.config'

const docsRouter = new Hono()

docsRouter.get('/swaggerConfig', (c) => c.json(swaggerConfig))

docsRouter.get('/docs', swaggerUI({ url: '/api/v1/swaggerConfig' }))

export default docsRouter