import type { FC, ReactNode, ButtonHTMLAttributes } from 'react'

import styles from './Button.module.scss'

export const ButtonVariant = {
  PRIMARY: 'primary',
  DANGER: 'danger',
} as const

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant]

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children: ReactNode
}

/**
 * Button component with loading state and variants
 */
export const Button: FC<ButtonProps> = (props) => {
  const {
    variant = ButtonVariant.PRIMARY,
    isLoading = false,
    children,
    disabled,
    className,
    ...rest
  } = props

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className={styles.loader}>
          <span className={styles.spinner} />
        </span>
      ) : (
        children
      )}
    </button>
  )
}
