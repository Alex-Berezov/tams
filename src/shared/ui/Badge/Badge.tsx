import type { FC, ReactNode } from 'react'

import styles from './Badge.module.scss'

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'critical'
  | 'muted'

export interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

/**
 * Badge component for status and label display
 */
export const Badge: FC<BadgeProps> = (props) => {
  const { variant = 'default', children, className } = props

  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ''}`}>
      {children}
    </span>
  )
}
