import type { FC, ReactNode } from 'react'

import styles from './Card.module.scss'

export interface CardProps {
  children: ReactNode
  className?: string
}

/**
 * Card container component
 */
export const Card: FC<CardProps> = ({ children, className }) => {
  return <div className={`${styles.card} ${className || ''}`}>{children}</div>
}

export interface CardHeaderProps {
  children: ReactNode
  className?: string
}

/**
 * Card header section
 */
export const CardHeader: FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={`${styles.header} ${className || ''}`}>{children}</div>
}

export interface CardContentProps {
  children: ReactNode
  className?: string
}

/**
 * Card content section
 */
export const CardContent: FC<CardContentProps> = ({ children, className }) => {
  return (
    <div className={`${styles.content} ${className || ''}`}>{children}</div>
  )
}

export interface CardFooterProps {
  children: ReactNode
  className?: string
}

/**
 * Card footer section
 */
export const CardFooter: FC<CardFooterProps> = ({ children, className }) => {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}
