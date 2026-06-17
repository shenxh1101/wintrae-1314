import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import classNames from 'classnames'
import type { ProcessingRecord } from '@/types/repair'
import { formatDateTime } from '@/utils/format'
import styles from './index.module.scss'

interface TimelineProps {
  records: ProcessingRecord[]
}

const Timeline: React.FC<TimelineProps> = ({ records }) => {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  )

  return (
    <View className={styles.timeline}>
      {sortedRecords.map((record) => (
        <View key={record.id} className={styles.item}>
          <View className={classNames(styles.dot, styles[record.type])} />
          <View className={styles.content}>
            <View className={styles.header}>
              <Text className={styles.title}>{record.title}</Text>
              <Text className={styles.time}>{formatDateTime(record.time)}</Text>
            </View>
            <Text className={styles.operator}>
              {record.operatorRole === 'resident' ? '住户' : 
               record.operatorRole === 'property' ? '物业' : '维修人员'} · {record.operator}
            </Text>
            <Text className={styles.desc}>{record.content}</Text>
            {record.photos && record.photos.length > 0 && (
              <View className={styles.photos}>
                {record.photos.map((photo) => (
                  <View key={photo.id} className={styles.photo}>
                    <Image src={photo.url} mode="aspectFill" />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  )
}

export default Timeline
