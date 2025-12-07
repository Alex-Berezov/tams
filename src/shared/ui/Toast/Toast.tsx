'use client'

import type { FC } from 'react'
import { useEffect } from 'react'

import styles from './Toast.module.scss'

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
} as const

export type ToastType = (typeof ToastType)[keyof typeof ToastType]

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

/**
 * Get icon for toast type
 */
const getIcon = (type: ToastType): string => {
  switch (type) {
    case ToastType.SUCCESS:
      return '✓'
    case ToastType.ERROR:
      return '✕'
    case ToastType.INFO:
      return 'ℹ'
    default:
      return ''
  }
}

/**
 * Toast notification component with auto-dismiss
 */
export const Toast: FC<ToastProps> = (props) => {
  const { id, type, message, duration = 4000, onClose } = props

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{getIcon(type)}</span>
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label='Close notification'
      >
        ×
      </button>
    </div>
  )
}
