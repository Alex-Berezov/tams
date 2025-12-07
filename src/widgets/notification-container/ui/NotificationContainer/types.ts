import type { ReactNode } from 'react'

/**
 * Notification type constants
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

/**
 * Notification container position constants
 */
export const NotificationPosition = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center',
} as const

export type NotificationPosition =
  (typeof NotificationPosition)[keyof typeof NotificationPosition]

/**
 * Notification interface
 */
export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
}

/**
 * Options for creating notification
 */
export interface NotificationOptions {
  title?: string
  duration?: number
}

/**
 * Notification context value
 */
export interface NotificationContextValue {
  notifications: Notification[]
  showNotification: (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  // Shorthand methods
  success: (message: string, options?: NotificationOptions) => string
  error: (message: string, options?: NotificationOptions) => string
  warning: (message: string, options?: NotificationOptions) => string
  info: (message: string, options?: NotificationOptions) => string
}

/**
 * Props for NotificationContainer
 */
export interface NotificationContainerProps {
  children: ReactNode
  /** Position of notifications on screen */
  position?: NotificationPosition
  /** Maximum number of simultaneous notifications */
  maxNotifications?: number
  /** Default display duration (ms) */
  defaultDuration?: number
}

/**
 * Props for notification item
 */
export interface NotificationItemProps {
  notification: Notification
  onClose: (id: string) => void
}
