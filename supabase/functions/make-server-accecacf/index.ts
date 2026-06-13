import "jsr:@std/dotenv/load";

import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import * as issueModel from './models/issueModel.ts'
import * as issueController from './controllers/issueController.ts'
import * as commentController from './controllers/commentController.ts'
import * as publicController from './controllers/publicController.ts'
import * as volunteerController from './controllers/volunteerController.ts'
import * as eventController from './controllers/eventController.ts'
import * as userController from './controllers/userController.ts'
import * as notificationController from './controllers/notificationController.ts'
import * as profileController from './controllers/profileController.ts'
import * as ideaController from './controllers/ideaController.ts'
import { logger } from './utils/logger.ts'
import { handleError } from './utils/errors.ts'
import type { AppContext, AppEnv } from './utils/types.ts'
import type { Next } from 'npm:hono'

const app = new Hono<AppEnv>()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))

// Tag every request with an ID (for log correlation and client-side error
// reports) and log a structured summary once it completes.
app.use('*', async (c: AppContext, next: Next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)

  const start = Date.now()
  await next()

  logger.info('request completed', {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - start,
  })
})

app.onError((err: Error, c: AppContext) => handleError(c, err, 'Internal server error'))

app.notFound((c: AppContext) => c.json({ error: 'Not found', code: 'NOT_FOUND', requestId: c.get('requestId') }, 404))

// Initialize storage bucket on startup
await issueModel.initializeStorage()

// Issue routes
app.post('/make-server-accecacf/issues/:id/assign-to-me', issueController.assignToMe)
app.post('/make-server-accecacf/issues/:id/upvote', issueController.toggleUpvote)
app.put('/make-server-accecacf/issues/:id/update', issueController.updateIssue)
app.post('/make-server-accecacf/issues', issueController.createIssue)
app.post('/make-server-accecacf/issues/:id/photo', issueController.uploadPhoto)
app.get('/make-server-accecacf/issues', issueController.getAllIssues)
app.get('/make-server-accecacf/issues/:id', issueController.getIssue)
app.get('/make-server-accecacf/my-issues', issueController.getUserIssues)
app.get('/make-server-accecacf/my-tasks', issueController.getTechnicianTasks)
app.patch('/make-server-accecacf/issues/:id/status', issueController.updateStatus)
app.get('/make-server-accecacf/stats', issueController.getStats)
app.get('/make-server-accecacf/analytics', issueController.getAnalytics)
app.get('/make-server-accecacf/hotspots', issueController.getHotspots)
app.post('/make-server-accecacf/issues/:id/assign', issueController.assignIssue)

// Comment routes
app.get('/make-server-accecacf/issues/:id/comments', commentController.getComments)
app.post('/make-server-accecacf/issues/:id/comments', commentController.createComment)
app.delete('/make-server-accecacf/issues/:id/comments/:commentId', commentController.deleteComment)

// Open Data API (read-only, anonymized)
app.get('/make-server-accecacf/public', publicController.getApiInfo)
app.get('/make-server-accecacf/public/issues', publicController.getPublicIssues)
app.get('/make-server-accecacf/public/stats', publicController.getPublicStats)
app.get('/make-server-accecacf/public/analytics', publicController.getPublicAnalytics)
app.get('/make-server-accecacf/public/hotspots', publicController.getPublicHotspots)

// Volunteer Task routes (local volunteer action)
app.get('/make-server-accecacf/volunteer-tasks', volunteerController.getAllTasks)
app.post('/make-server-accecacf/volunteer-tasks', volunteerController.createTask)
app.get('/make-server-accecacf/volunteer-tasks/:id', volunteerController.getTask)
app.post('/make-server-accecacf/volunteer-tasks/:id/join', volunteerController.joinTask)
app.post('/make-server-accecacf/volunteer-tasks/:id/leave', volunteerController.leaveTask)
app.patch('/make-server-accecacf/volunteer-tasks/:id/status', volunteerController.updateTaskStatus)
app.delete('/make-server-accecacf/volunteer-tasks/:id', volunteerController.deleteTask)

// Community Event routes
app.get('/make-server-accecacf/events', eventController.getAllEvents)
app.post('/make-server-accecacf/events', eventController.createEvent)
app.get('/make-server-accecacf/events/:id', eventController.getEvent)
app.post('/make-server-accecacf/events/:id/rsvp', eventController.rsvpEvent)
app.post('/make-server-accecacf/events/:id/cancel-rsvp', eventController.cancelRsvp)
app.patch('/make-server-accecacf/events/:id/status', eventController.updateEventStatus)
app.delete('/make-server-accecacf/events/:id', eventController.deleteEvent)

// Community Ideas (forum / idea exchange) routes
app.get('/make-server-accecacf/ideas', ideaController.getAllIdeas)
app.post('/make-server-accecacf/ideas', ideaController.createIdea)
app.get('/make-server-accecacf/ideas/:id', ideaController.getIdea)
app.post('/make-server-accecacf/ideas/:id/vote', ideaController.toggleVote)
app.patch('/make-server-accecacf/ideas/:id/status', ideaController.updateIdeaStatus)
app.delete('/make-server-accecacf/ideas/:id', ideaController.deleteIdea)
app.get('/make-server-accecacf/ideas/:id/comments', ideaController.getComments)
app.post('/make-server-accecacf/ideas/:id/comments', ideaController.createComment)
app.delete('/make-server-accecacf/ideas/:id/comments/:commentId', ideaController.deleteComment)

// User routes
app.get('/make-server-accecacf/users', userController.getUsers)
app.post('/make-server-accecacf/users', userController.createUser)
app.patch('/make-server-accecacf/users/:id', userController.updateUser)
app.delete('/make-server-accecacf/users/:id', userController.deleteUser)

// Notification routes
app.get('/make-server-accecacf/notifications', notificationController.getNotifications)
app.post('/make-server-accecacf/notifications', notificationController.sendNotification)
app.patch('/make-server-accecacf/notifications/:id/read', notificationController.markAsRead)

// Profile routes
app.get('/make-server-accecacf/leaderboard', profileController.getLeaderboard)
app.get('/make-server-accecacf/profile', profileController.getProfile)
app.patch('/make-server-accecacf/profile', profileController.updateProfile)
app.post('/make-server-accecacf/profile/avatar', profileController.uploadAvatar)

Deno.serve({ port: 8001 }, app.fetch)