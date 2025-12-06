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
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ''}`}>
      {children}
    </span>
  )
}
