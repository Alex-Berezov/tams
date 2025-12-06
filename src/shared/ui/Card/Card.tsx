import styles from './Card.module.scss'

export interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`${styles.card} ${className || ''}`}>{children}</div>
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
}) => {
  return <div className={`${styles.header} ${className || ''}`}>{children}</div>
}

export interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`${styles.content} ${className || ''}`}>{children}</div>
  )
}

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
}) => {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}
