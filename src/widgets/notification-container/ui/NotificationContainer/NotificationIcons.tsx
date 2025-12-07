import type { ReactNode } from 'react'

import { SuccessIcon, ErrorIcon, WarningIcon, InfoIcon } from '@shared/ui'

import { NotificationType } from './types'
import type { NotificationType as NotificationTypeType } from './types'

import styles from './NotificationContainer.module.scss'

/**
 * Get icon component for notification type
 */
export const getNotificationIcon = (type: NotificationTypeType): ReactNode => {
  const iconClass = styles.iconSvg

  switch (type) {
    case NotificationType.SUCCESS:
      return <SuccessIcon className={iconClass} />
    case NotificationType.ERROR:
      return <ErrorIcon className={iconClass} />
    case NotificationType.WARNING:
      return <WarningIcon className={iconClass} />
    case NotificationType.INFO:
      return <InfoIcon className={iconClass} />
  }
}
