import React from 'react'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import type { RepairStatus } from '@/types/repair'
import { statusMap } from '@/utils/format'
import styles from './index.module.scss'

interface StatusBadgeProps {
  status: RepairStatus
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { label } = statusMap[status]
  
  return (
    <View className={classNames(styles.badge, styles[status], className)}>
      {label}
    </View>
  )
}

export default StatusBadge
