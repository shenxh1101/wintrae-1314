import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { Announcement } from '@/types/repair'
import { getAnnouncements } from '@/data/mockAnnouncement'
import { formatTime, categoryMap } from '@/utils/format'
import styles from './index.module.scss'

type CategoryType = 'all' | 'notice' | 'maintenance' | 'safety' | 'activity'

const categories: { key: CategoryType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'notice', label: '通知' },
  { key: 'maintenance', label: '维护' },
  { key: 'safety', label: '安全' },
  { key: 'activity', label: '活动' }
]

const AnnouncementPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const loadData = useCallback(() => {
    console.log('[AnnouncementPage] 加载公告列表')
    try {
      const list = getAnnouncements()
      const sortedList = [...list].sort((a, b) => {
        if (a.isTop && !b.isTop) return -1
        if (!a.isTop && b.isTop) return 1
        return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      })
      setAnnouncements(sortedList)
    } catch (error) {
      console.error('[AnnouncementPage] 加载公告列表失败', error)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useDidShow(() => {
    loadData()
  })

  usePullDownRefresh(() => {
    loadData()
    setTimeout(() => {
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const filteredAnnouncements = useMemo(() => {
    if (activeCategory === 'all') return announcements
    return announcements.filter(a => a.category === activeCategory)
  }, [announcements, activeCategory])

  const handleCategoryChange = (key: CategoryType) => {
    console.log('[AnnouncementPage] 切换分类:', key)
    setActiveCategory(key)
  }

  const handleAnnouncementClick = (id: string) => {
    console.log('[AnnouncementPage] 查看公告详情:', id)
    Taro.navigateTo({ url: `/pages/detail/index?announcementId=${id}` })
  }

  return (
    <View className={styles.container}>
      <ScrollView className={styles.categoryTabs} scrollX>
        {categories.map(cat => (
          <View
            key={cat.key}
            className={classNames(styles.categoryTab, activeCategory === cat.key && styles.active)}
            onClick={() => handleCategoryChange(cat.key)}
          >
            {cat.label}
          </View>
        ))}
      </ScrollView>

      <ScrollView className={styles.list} scrollY>
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map(announcement => {
            const categoryInfo = categoryMap[announcement.category]
            return (
              <View
                key={announcement.id}
                className={styles.card}
                onClick={() => handleAnnouncementClick(announcement.id)}
              >
                {announcement.coverImage && (
                  <View className={styles.cover}>
                    <Image src={announcement.coverImage} mode="aspectFill" />
                    {announcement.isTop && (
                      <View className={styles.topBadge}>置顶</View>
                    )}
                    <View
                      className={styles.categoryBadge}
                      style={{ color: categoryInfo?.color }}
                    >
                      {categoryInfo?.label}
                    </View>
                  </View>
                )}
                <View className={styles.content}>
                  {!announcement.coverImage && (
                    <View style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      {announcement.isTop && (
                        <View className={styles.topBadge} style={{ position: 'static' }}>置顶</View>
                      )}
                      <View
                        className={styles.categoryBadge}
                        style={{ position: 'static', background: `${categoryInfo?.color}15`, color: categoryInfo?.color }}
                      >
                        {categoryInfo?.label}
                      </View>
                    </View>
                  )}
                  <Text className={styles.title}>{announcement.title}</Text>
                  <Text className={styles.desc}>{announcement.content}</Text>
                  <View className={styles.meta}>
                    <View className={styles.publisher}>
                      <Text>🏢</Text>
                      <Text>{announcement.publisher}</Text>
                    </View>
                    <Text>{formatTime(announcement.publishTime)}</Text>
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无公告</Text>
            <Text className={styles.emptySubText}>
              {activeCategory === 'all' ? '当前没有任何公告' : `当前没有${categories.find(c => c.key === activeCategory)?.label}类公告`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default AnnouncementPage
