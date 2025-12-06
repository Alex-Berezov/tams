'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import styles from './NotificationContainer.module.scss'

/**
 * Типы уведомлений
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * Позиция контейнера уведомлений
 */
export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

/**
 * Интерфейс уведомления
 */
export interface Notification {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
}

/**
 * Опции для создания уведомления
 */
export interface NotificationOptions {
  title?: string
  duration?: number
}

/**
 * Контекст уведомлений
 */
interface NotificationContextValue {
  notifications: Notification[]
  showNotification: (
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  // Короткие методы
  success: (message: string, options?: NotificationOptions) => string
  error: (message: string, options?: NotificationOptions) => string
  warning: (message: string, options?: NotificationOptions) => string
  info: (message: string, options?: NotificationOptions) => string
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

/**
 * Hook для использования уведомлений
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

/**
 * Props для отдельного уведомления
 */
interface NotificationItemProps {
  notification: Notification
  onClose: (id: string) => void
}

/**
 * Компонент отдельного уведомления
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const { id, type, title, message, duration = 4000 } = notification
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration <= 0) return

    const hideTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration)

    const removeTimer = setTimeout(() => {
      onClose(id)
    }, duration + 200) // 200ms for exit animation

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 200)
  }

  return (
    <div
      className={`${styles.notification} ${styles[type]} ${
        isExiting ? styles.exiting : ''
      }`}
      role='alert'
      aria-live='polite'
    >
      <span className={styles.icon}>{getIcon(type)}</span>
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{message}</p>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label='Close notification'
      >
        ×
      </button>
    </div>
  )
}

/**
 * Получить иконку для типа уведомления
 */
function getIcon(type: NotificationType): ReactNode {
  switch (type) {
    case 'success':
      return (
        <svg
          className={styles.iconSvg}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
          <polyline points='22 4 12 14.01 9 11.01' />
        </svg>
      )
    case 'error':
      return (
        <svg
          className={styles.iconSvg}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='15' y1='9' x2='9' y2='15' />
          <line x1='9' y1='9' x2='15' y2='15' />
        </svg>
      )
    case 'warning':
      return (
        <svg
          className={styles.iconSvg}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
          <line x1='12' y1='9' x2='12' y2='13' />
          <line x1='12' y1='17' x2='12.01' y2='17' />
        </svg>
      )
    case 'info':
      return (
        <svg
          className={styles.iconSvg}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='16' x2='12' y2='12' />
          <line x1='12' y1='8' x2='12.01' y2='8' />
        </svg>
      )
  }
}

/**
 * Props для NotificationContainer
 */
export interface NotificationContainerProps {
  children: ReactNode
  /** Позиция уведомлений на экране */
  position?: NotificationPosition
  /** Максимальное количество одновременных уведомлений */
  maxNotifications?: number
  /** Длительность показа по умолчанию (мс) */
  defaultDuration?: number
}

/**
 * Widget: NotificationContainer
 *
 * Контейнер для показа уведомлений с:
 * - Автоскрытием по таймеру
 * - Поддержкой разных типов (success, error, warning, info)
 * - Настраиваемой позицией
 * - Анимациями появления/исчезновения
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  children,
  position = 'top-right',
  maxNotifications = 5,
  defaultDuration = 4000,
}) => {
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
        // Ограничение количества уведомлений
        if (newNotifications.length > maxNotifications) {
          return newNotifications.slice(-maxNotifications)
        }
        return newNotifications
      })

      return id
    },
    [defaultDuration, maxNotifications]
  )

  // Короткие методы для удобства
  const success = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification('success', message, options),
    [showNotification]
  )

  const error = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification('error', message, options),
    [showNotification]
  )

  const warning = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification('warning', message, options),
    [showNotification]
  )

  const info = useCallback(
    (message: string, options?: NotificationOptions) =>
      showNotification('info', message, options),
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

  // Маппинг позиции на CSS класс
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
