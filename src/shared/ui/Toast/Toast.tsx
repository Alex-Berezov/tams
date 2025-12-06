'use client'

import { useEffect } from 'react'
import styles from './Toast.module.scss'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  duration = 4000,
  onClose,
}) => {
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

function getIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'info':
      return 'ℹ'
    default:
      return ''
  }
}
