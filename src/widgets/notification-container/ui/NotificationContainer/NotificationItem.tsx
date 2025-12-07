'use client'

import type { FC } from 'react'
import { useState, useEffect } from 'react'

import type { NotificationItemProps } from './types'
import { getNotificationIcon } from './NotificationIcons'

import styles from './NotificationContainer.module.scss'

/**
 * Single notification item component with auto-dismiss
 */
export const NotificationItem: FC<NotificationItemProps> = (props) => {
  const { notification, onClose } = props
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
      <span className={styles.icon}>{getNotificationIcon(type)}</span>
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
