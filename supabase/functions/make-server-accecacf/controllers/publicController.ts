import type { AppContext } from '../utils/types.ts'
import * as issueModel from '../models/issueModel.ts'
import { handleError } from '../utils/errors.ts'

const MAX_LIMIT = 200

export async function getApiInfo(c: AppContext) {
  return c.json({
    name: 'CIRT Open Data API',
    description: 'Read-only, anonymized civic issue data for researchers, urban planners, and developers.',
    version: '1.0',
    endpoints: [
      {
        path: '/public/issues',
        method: 'GET',
        description: 'Paginated, anonymized list of reported issues.',
        query: {
          status: 'Filter by status (reported, in-progress, resolved, rejected)',
          category: 'Filter by category',
          limit: `Page size, max ${MAX_LIMIT} (default 50)`,
          offset: 'Pagination offset (default 0)',
        },
      },
      {
        path: '/public/stats',
        method: 'GET',
        description: 'Aggregate counts of issues by status, category, and priority.',
      },
      {
        path: '/public/analytics',
        method: 'GET',
        description: 'Resolution rate, average resolution time, and reporting trends.',
      },
      {
        path: '/public/hotspots',
        method: 'GET',
        description: 'Recurring problem locations with at least two reported issues.',
      },
    ],
  })
}

export async function getPublicIssues(c: AppContext) {
  try {
    const status = c.req.query('status') || undefined
    const category = c.req.query('category') || undefined
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(c.req.query('limit')) || 50))
    const offset = Math.max(0, Number(c.req.query('offset')) || 0)

    const result = await issueModel.getPublicIssues({ status, category, limit, offset })
    return c.json(result)
  } catch (error) {
    return handleError(c, error, 'Failed to fetch public issues')
  }
}

export async function getPublicStats(c: AppContext) {
  try {
    const stats = await issueModel.getStats()
    return c.json({ stats })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch public statistics')
  }
}

export async function getPublicAnalytics(c: AppContext) {
  try {
    const analytics = await issueModel.getAnalytics()
    return c.json({ analytics })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch public analytics')
  }
}

export async function getPublicHotspots(c: AppContext) {
  try {
    const hotspots = await issueModel.getHotspots()
    return c.json({ hotspots })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch public hotspots')
  }
}
