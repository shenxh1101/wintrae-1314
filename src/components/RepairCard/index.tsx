import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import type { RepairOrder } from '@/types/repair'
import { formatTime, formatLocation } from '@/utils/format'
import StatusBadge from '@/components/StatusBadge'
import UrgencyBadge from '@/components/UrgencyBadge'
import styles from './index.module.scss'

interface RepairCardProps {
  order: RepairOrder
  onClick?: () => void
}

const RepairCard: React.FC<RepairCardProps> = ({ order, onClick }) => {
  const thumbUrl = order.photos?.[0]?.url

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{order.title}</Text>
        <View className={styles.badges}>
          <UrgencyBadge urgency={order.urgency} />
          <StatusBadge status={order.status} />
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.thumb}>
          {thumbUrl ? (
            <Image src={thumbUrl} mode="aspectFill" />
          ) : (
            <View className={styles.thumbPlaceholder}>
              {order.facilityType.icon}
            </View>
          )}
        </View>
        <View className={styles.info}>
          <Text className={styles.desc}>{order.description}</Text>
          <View className={styles.meta}>
            <View className={styles.metaItem}>
              <Text>📍</Text>
              <Text>{formatLocation(order.location)}</Text>
            </View>
            <View className={styles.metaItem}>
              <Text>🔧</Text>
              <Text>{order.facilityType.name}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <Text className={styles.orderNo}>单号：{order.orderNo}</Text>
        {order.expectedTime && order.status === 'processing' ? (
          <Text className={styles.expectedTime}>预计 {formatTime(order.expectedTime)} 完成</Text>
        ) : (
          <Text className={styles.time}>{formatTime(order.submitTime)}</Text>
        )}
      </View>
    </View>
  )
}

export default RepairCard
