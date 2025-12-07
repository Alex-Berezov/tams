'use client'

import { createContext, useContext } from 'react'

import type { NotificationContextValue } from './types'

export const NotificationContext =
  createContext<NotificationContextValue | null>(null)

/**
 * Hook for using notifications
 */
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationContainer'
    )
  }
  return context
}
