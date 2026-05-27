"use client"

export const STOCK_DATA_CHANGED_EVENT = "stock-data-changed"
export const STOCK_DATA_CHANGED_STORAGE_KEY = "stock-data-changed-at"

export function notifyStockChanged() {
  const timestamp = new Date().toISOString()

  try {
    window.localStorage.setItem(STOCK_DATA_CHANGED_STORAGE_KEY, timestamp)
  } catch {
    // localStorage can be unavailable in restrictive browser settings.
  }

  window.dispatchEvent(new Event(STOCK_DATA_CHANGED_EVENT))
}
