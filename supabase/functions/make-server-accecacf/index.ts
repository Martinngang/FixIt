import "jsr:@std/dotenv/load";

import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as issueModel from './models/issueModel.ts'
import * as issueController from './controllers/issueController.ts'
import * as userController from './controllers/userController.ts'
import * as notificationController from './controllers/notificationController.ts'
import * as profileController from './controllers/profileController.ts'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*']
}))

app.use('*', logger(console.log))

// Initialize storage bucket on startup
await issueModel.initializeStorage()

// Issue routes
app.post('/make-server-accecacf/issues/:id/assign-to-me', issueController.assignToMe)
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
app.post('/make-server-accecacf/issues/:id/assign', issueController.assignIssue)

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
app.get('/make-server-accecacf/profile', profileController.getProfile)
app.patch('/make-server-accecacf/profile', profileController.updateProfile)
app.post('/make-server-accecacf/profile/avatar', profileController.uploadAvatar)

Deno.serve({ port: 8001 }, app.fetch)