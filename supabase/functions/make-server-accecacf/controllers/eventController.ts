import type { AppContext } from '../utils/types.ts'
import * as eventModel from '../models/eventModel.ts'
import * as notificationModel from '../models/notificationModel.ts'
import { getEffectiveUserRole } from '../models/userModel.ts'
import { getAuthenticatedUser } from '../utils/auth.ts'
import { handleError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.ts'

function requireStaff(role: string) {
  if (role !== 'admin' && role !== 'technician') {
    throw new ForbiddenError('Only local authorities can manage community events')
  }
}

export async function getAllEvents(c: AppContext) {
  try {
    const status = c.req.query('status') || undefined
    const category = c.req.query('category') || undefined
    const events = await eventModel.getAllEvents({ status, category })
    return c.json({ events })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch events')
  }
}

export async function getEvent(c: AppContext) {
  try {
    const event = await eventModel.getEvent(c.req.param('id'))
    if (!event) throw new NotFoundError('Event not found')
    return c.json({ event })
  } catch (error) {
    return handleError(c, error, 'Failed to fetch event')
  }
}

export async function createEvent(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const { title, description, category, location, coordinates, eventDate, maxAttendees } = await c.req.json()

    const event = await eventModel.createEvent({
      title,
      description,
      category,
      location,
      coordinates,
      eventDate,
      maxAttendees,
      createdBy: user.id,
      createdByName: user.user_metadata?.name || user.email,
    })

    return c.json({ success: true, event })
  } catch (error) {
    return handleError(c, error, 'Failed to create event')
  }
}

export async function rsvpEvent(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const event = await eventModel.rsvpEvent(c.req.param('id'), user.id, user.user_metadata?.name || user.email)
    return c.json({ success: true, event })
  } catch (error) {
    return handleError(c, error, 'Failed to RSVP to event')
  }
}

export async function cancelRsvp(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    const event = await eventModel.cancelRsvp(c.req.param('id'), user.id)
    return c.json({ success: true, event })
  } catch (error) {
    return handleError(c, error, 'Failed to cancel RSVP')
  }
}

export async function updateEventStatus(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    const { status } = await c.req.json()
    if (!status) throw new ValidationError('status is required')

    const event = await eventModel.updateEventStatus(c.req.param('id'), status)

    if (status === 'cancelled') {
      for (const attendee of event.attendees || []) {
        await notificationModel.createNotification({
          recipientId: attendee.userId,
          title: 'Event Cancelled',
          message: `The event "${event.title}" you RSVPed to has been cancelled.`,
          type: 'event_cancelled',
          senderId: user.id,
          senderName: user.user_metadata?.name || user.email,
        })
      }
    }

    return c.json({ success: true, event })
  } catch (error) {
    return handleError(c, error, 'Failed to update event')
  }
}

export async function deleteEvent(c: AppContext) {
  try {
    const user = await getAuthenticatedUser(c)
    requireStaff(getEffectiveUserRole(user, c.req))

    await eventModel.deleteEvent(c.req.param('id'))
    return c.json({ success: true })
  } catch (error) {
    return handleError(c, error, 'Failed to delete event')
  }
}
