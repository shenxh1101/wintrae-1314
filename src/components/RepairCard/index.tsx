import React, { useMemo } from 'react'
import { View, Text, Image } from '@tarojs/components'
import classNames from 'classnames'
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

  const completedPhotos = useMemo(() => {
    if (order.status !== 'completed' && order.status !== 'rated') return []
    const completeRecord = order.processingRecords
      ?.slice()
      .reverse()
      .find(r => r.type === 'complete')
    return completeRecord?.photos || []
  }, [order.processingRecords, order.status])

  const completedTime = useMemo(() => {
    if (order.status !== 'completed' && order.status !== 'rated') return null
    const completeRecord = order.processingRecords
      ?.slice()
      .reverse()
      .find(r => r.type === 'complete')
    return completeRecord?.time || null
  }, [order.processingRecords, order.status])

  return (
    <View
      className={classNames(
        styles.card,
        order.urgeRecords?.length > 0 && styles.urged,
        order.status === 'completed' && styles.pendingConfirm,
      )}
      onClick={onClick}
    >
      <View className={styles.header}>
        <Text className={styles.title}>{order.title}</Text>
        <View className={styles.badges}>
          <UrgencyBadge urgency={order.urgency} />
          <StatusBadge status={order.status} />
          {order.urgeRecords?.length > 0 && (
            <View className={classNames(styles.smallBadge, styles.urgedBadge)}>
              ⏰{order.urgeRecords.length}
            </View>
          )}
          {order.status === 'completed' && (
            <View className={classNames(styles.smallBadge, styles.confirmBadge)}>
              待确认
            </View>
          )}
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
            {order.assignedTo && (
              <View className={classNames(styles.metaItem, styles.maintainerMeta)}>
                <Text>👷</Text>
                <Text>{order.assignedTo}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {completedPhotos.length > 0 && (
        <View className={styles.completedSection}>
          <View className={styles.completedLabel}>
            <Text>📸 完工照片</Text>
          </View>
          <View className={styles.completedPhotos}>
            {completedPhotos.slice(0, 4).map((photo, idx) => (
              <Image
                key={idx}
                className={styles.completedPhoto}
                src={photo.url}
                mode="aspectFill"
              />
            ))}
            {completedPhotos.length > 4 && (
              <View className={styles.completedPhotoMore}>
                <Text>+{completedPhotos.length - 4}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.orderNo}>单号：{order.orderNo}</Text>
        {order.status === 'processing' && order.expectedTime ? (
          <Text className={styles.expectedTime}>预计 {formatTime(order.expectedTime)} 完成</Text>
        ) : completedTime ? (
          <Text className={styles.completedTime}>✅ {formatTime(completedTime)} 完工</Text>
        ) : (
          <Text className={styles.time}>{formatTime(order.submitTime)}</Text>
        )}
      </View>
    </View>
  )
}

export default RepairCard
