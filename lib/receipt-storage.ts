// Simple in-memory store (for development)
// In production, use Redis, database, or file storage

interface StoredReceipts {
  sessionId: string
  stripeSessionId: string
  receipts: any[]
  createdAt: Date
  expiresAt: Date // 30 minutes from creation
}

const receiptStore = new Map<string, StoredReceipts>()

export function storeReceipts(sessionId: string, stripeSessionId: string, receipts: any[]) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes
  
  receiptStore.set(sessionId, {
    sessionId,
    stripeSessionId,
    receipts,
    createdAt: now,
    expiresAt
  })
  
  // Cleanup expired entries periodically
  setTimeout(() => {
    receiptStore.delete(sessionId)
  }, 30 * 60 * 1000)
  
  return sessionId
}

export function getReceipts(sessionId: string) {
  const data = receiptStore.get(sessionId)
  if (!data) return null
  
  // Check if expired
  if (new Date() > data.expiresAt) {
    receiptStore.delete(sessionId)
    return null
  }
  
  return data
}

export function deleteReceipts(sessionId: string) {
  receiptStore.delete(sessionId)
}