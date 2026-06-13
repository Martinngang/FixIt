import type { Context } from 'npm:hono'

export type AppEnv = {
  Variables: {
    requestId: string
  }
}

export type AppContext = Context<AppEnv>
