'use client'

import type { FC } from 'react'
import { useState, useCallback } from 'react'

import {
  NotificationType,
  type Notification,
  type NotificationOptions,
  type NotificationContainerProps,
  type NotificationContextValue,
} from './types'
import { NotificationContext } from './context'
import { NotificationItem } from './NotificationItem'

import styles from './NotificationContainer.module.scss'

/**
 * Widget: NotificationContainer
 *
 * Container for displaying notifications with:
 * - Auto-hide timer
 * - Support for different types (success, error, warning, info)
 * - Configurable position
 * - Appear/disappear animations
 */
export const NotificationContainer: FC<NotificationContainerProps> = (
  props
) => {
  const {
    children,
    position = 'top-right',
    maxNotifications = 5,
    defaultDuration = 4000,
  } = props

  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const showNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      options?: NotificationOptions
    ): string => {
      const id = `notification-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`

      const notification: Notification = {
        id,
        type,
        message,
        title: options?.title,
        duration: options?.duration ?? defaultDuration,
      }

      setNotifications((prev) => {
        const newNotifications = [...prev, notification]
        // Limit number of notifications
        if (newNotifications.length > maxNotifications) {
          return newNotifications.slice(-maxNotifications)
        }
        return newNotifications
      })

      return id
    },
    [defaultDuration, maxNotifications]
  )

  // Shorthand methods for convenience
  const success = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification(NotificationType.SUCCESS, message, options),
    [showNotification]
  )

  const error = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification(NotificationType.ERROR, message, options),
    [showNotification]
  )

  const warning = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification(NotificationType.WARNING, message, options),
    [showNotification]
  )

  const info = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification(NotificationType.INFO, message, options),
    [showNotification]
  )

  const contextValue: NotificationContextValue = {
    notifications,
    showNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }

  // Map position to CSS class
  const positionClass = {
    'top-right': styles.topRight,
    'top-left': styles.topLeft,
    'bottom-right': styles.bottomRight,
    'bottom-left': styles.bottomLeft,
    'top-center': styles.topCenter,
    'bottom-center': styles.bottomCenter,
  }[position]

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div
        className={`${styles.notificationContainer} ${positionClass}`}
        aria-label='Notifications'
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
