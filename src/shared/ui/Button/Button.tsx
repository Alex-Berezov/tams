import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'danger'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
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
