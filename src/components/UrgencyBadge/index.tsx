import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import type { UrgencyLevel } from '@/types/repair'
import { urgencyMap } from '@/utils/format'
import styles from './index.module.scss'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  className?: string
}

const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, className }) => {
  const { label } = urgencyMap[urgency]
  
  return (
    <View className={classNames(styles.badge, styles[urgency], className)}>
      {label}
    </View>
  )
}

export default UrgencyBadge
