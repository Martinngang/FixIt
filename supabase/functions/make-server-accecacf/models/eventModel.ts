import * as kv from '../kv_store.tsx'
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.ts'

export const COMMUNITY_EVENT_STATUSES = ['upcoming', 'completed', 'cancelled'] as const

export async function createEvent({
  title,
  description,
  category,
  location,
  coordinates,
  eventDate,
  maxAttendees,
  createdBy,
  createdByName,
}: {
  title: string
  description: string
  category?: string
  location: string
  coordinates?: { lat: number; lng: number } | null
  eventDate: string
  maxAttendees?: number | null
  createdBy: string
  createdByName: string
}) {
  const trimmedTitle = (title || '').trim()
  const trimmedDescription = (description || '').trim()
  if (!trimmedTitle) throw new ValidationError('Title is required')
  if (!trimmedDescription) throw new ValidationError('Description is required')
  if (!(location || '').trim()) throw new ValidationError('Location is required')
  if (!eventDate || Number.isNaN(new Date(eventDate).getTime())) throw new ValidationError('A valid eventDate is required')

  const event = {
    id: crypto.randomUUID(),
    title: trimmedTitle,
    description: trimmedDescription,
    category: category || 'Other',
    location: location.trim(),
    coordinates: coordinates ?? null,
    eventDate: new Date(eventDate).toISOString(),
    maxAttendees: maxAttendees ?? null,
    status: 'upcoming' as typeof COMMUNITY_EVENT_STATUSES[number],
    attendees: [] as Array<{ userId: string; userName: string; joinedAt: string }>,
    createdBy,
    createdByName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`community_event:${event.id}`, event)
  return event
}

export async function getAllEvents({ status, category }: { status?: string; category?: string } = {}) {
  let events = await kv.getByPrefix('community_event:')

  if (status) events = events.filter(event => event.status === status)
  if (category) events = events.filter(event => event.category === category)

  return events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
}

export async function getEvent(eventId: string) {
  return await kv.get(`community_event:${eventId}`)
}

export async function rsvpEvent(eventId: string, userId: string, userName: string) {
  const event = await kv.get(`community_event:${eventId}`)
  if (!event) throw new NotFoundError('Event not found')
  if (event.status !== 'upcoming') throw new ConflictError('RSVPs are closed for this event')

  const attendees: Array<{ userId: string; userName: string; joinedAt: string }> = event.attendees || []
  if (attendees.some(a => a.userId === userId)) throw new ConflictError('You have already RSVPed to this event')
  if (event.maxAttendees && attendees.length >= event.maxAttendees) throw new ConflictError('This event is fully booked')

  const updatedEvent = {
    ...event,
    attendees: [...attendees, { userId, userName, joinedAt: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`community_event:${eventId}`, updatedEvent)
  return updatedEvent
}

export async function cancelRsvp(eventId: string, userId: string) {
  const event = await kv.get(`community_event:${eventId}`)
  if (!event) throw new NotFoundError('Event not found')

  const attendees: Array<{ userId: string; userName: string; joinedAt: string }> = event.attendees || []
  if (!attendees.some(a => a.userId === userId)) throw new ConflictError('You have not RSVPed to this event')

  const updatedEvent = {
    ...event,
    attendees: attendees.filter(a => a.userId !== userId),
    updatedAt: new Date().toISOString(),
  }

  await kv.set(`community_event:${eventId}`, updatedEvent)
  return updatedEvent
}

export async function updateEventStatus(eventId: string, status: string) {
  if (!COMMUNITY_EVENT_STATUSES.includes(status as typeof COMMUNITY_EVENT_STATUSES[number])) {
    throw new ValidationError(`status must be one of: ${COMMUNITY_EVENT_STATUSES.join(', ')}`)
  }

  const event = await kv.get(`community_event:${eventId}`)
  if (!event) throw new NotFoundError('Event not found')

  const updatedEvent = { ...event, status, updatedAt: new Date().toISOString() }
  await kv.set(`community_event:${eventId}`, updatedEvent)
  return updatedEvent
}

export async function deleteEvent(eventId: string) {
  const event = await kv.get(`community_event:${eventId}`)
  if (!event) throw new NotFoundError('Event not found')
  await kv.del(`community_event:${eventId}`)
}
