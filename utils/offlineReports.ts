import { projectId } from "./supabase/info"

const DB_NAME = 'fixit-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-reports'

export interface PendingReportData {
  title: string
  description: string
  category: string
  location: string
  priority: string
  coordinates: { lat: number | null; lng: number | null }
}

export interface PendingReport {
  id: string
  createdAt: string
  data: PendingReportData
  photo: Blob | null
  photoName: string | null
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePendingReport(report: { data: PendingReportData; photo: Blob | null; photoName: string | null }): Promise<PendingReport> {
  const db = await openDB()
  const record: PendingReport = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...report
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add(record)
    tx.oncomplete = () => resolve(record)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getAllPendingReports(): Promise<PendingReport[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve((request.result || []) as PendingReport[])
    request.onerror = () => reject(request.error)
  })
}

export async function deletePendingReport(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export interface SyncResult {
  synced: number
  failed: number
}

// Pushes locally-stored reports to the server in the order they were
// created. Stops early if a request fails due to a network error (the
// device is still offline) so the remaining reports stay queued for the
// next sync attempt, but keeps going past server-side errors (e.g. a
// rejected report) so one bad record can't block the rest of the queue.
export async function syncPendingReports(accessToken: string): Promise<SyncResult> {
  const reports = await getAllPendingReports()
  let synced = 0
  let failed = 0

  for (const report of reports) {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(report.data)
      })

      if (!response.ok) {
        failed++
        continue
      }

      const result = await response.json()

      if (report.photo) {
        try {
          const photoFormData = new FormData()
          photoFormData.append('photo', report.photo, report.photoName || 'photo.jpg')
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-accecacf/issues/${result.issue.id}/photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: photoFormData
          })
        } catch {
          // Issue was created successfully; a failed photo upload isn't
          // worth re-queuing the whole report for.
        }
      }

      await deletePendingReport(report.id)
      synced++
    } catch {
      // Network error - device is likely offline again. Leave this and
      // any remaining reports queued for the next sync attempt.
      break
    }
  }

  return { synced, failed }
}
