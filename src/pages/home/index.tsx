import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Swiper, SwiperItem, Image, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import classNames from 'classnames'
import type { RepairOrder, Announcement, FacilityType } from '@/types/repair'
import { getRepairOrders } from '@/data/mockRepair'
import { getAnnouncements } from '@/data/mockAnnouncement'
import { facilityTypes } from '@/data/mockRepair'
import { formatTime, categoryMap } from '@/utils/format'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, rated: 0 })

  const loadData = useCallback(() => {
    console.log('[HomePage] 加载首页数据')
    const orderList = getRepairOrders()
    const announcementList = getAnnouncements()
    
    setOrders(orderList)
    setAnnouncements(announcementList)
    setStats({
      pending: orderList.filter(o => o.status === 'pending').length,
      processing: orderList.filter(o => o.status === 'processing').length,
      completed: orderList.filter(o => o.status === 'completed').length,
      rated: orderList.filter(o => o.status === 'rated').length
    })
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

  const handleQuickRepair = () => {
    console.log('[HomePage] 点击快捷报修')
    Taro.navigateTo({ url: '/pages/submit/index' })
  }

  const handleFacilityClick = (facility: FacilityType) => {
    console.log('[HomePage] 选择设施类型:', facility.name)
    Taro.navigateTo({ 
      url: `/pages/submit/index?facilityId=${facility.id}` 
    })
  }

  const handleOrderClick = (orderId: string) => {
    console.log('[HomePage] 查看工单详情:', orderId)
    Taro.navigateTo({ url: `/pages/detail/index?id=${orderId}` })
  }

  const handleAnnouncementClick = (announcementId: string) => {
    console.log('[HomePage] 查看公告详情:', announcementId)
    Taro.navigateTo({ 
      url: `/pages/detail/index?announcementId=${announcementId}` 
    })
  }

  const handleViewMoreOrders = () => {
    Taro.switchTab({ url: '/pages/list/index' })
  }

  const handleViewMoreAnnouncements = () => {
    Taro.switchTab({ url: '/pages/announcement/index' })
  }

  const bannerAnnouncements = announcements.filter(a => a.isTop).slice(0, 3)
  const latestAnnouncements = announcements.slice(0, 3)
  const myOrders = orders.slice(0, 3)

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <Text className={styles.greeting}>您好，业主</Text>
        <Text className={styles.subGreeting}>欢迎使用小区报修服务</Text>
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.entryCard} onClick={handleQuickRepair}>
          <Text className={styles.entryTitle}>📝 一键报修</Text>
          <Text className={styles.entryDesc}>快速提交公共设施报修申请，物业及时响应</Text>
          <Button className={styles.entryBtn} onClick={handleQuickRepair}>
            立即报修
          </Button>
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待接单</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={classNames(styles.statNum, { [styles.processing]: true })}>{stats.processing}</Text>
          <Text className={styles.statLabel}>处理中</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum} style={{ color: '#52c41a' }}>{stats.completed}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statItem} onClick={() => Taro.switchTab({ url: '/pages/list/index' })}>
          <Text className={styles.statNum} style={{ color: '#86909c' }}>{stats.rated}</Text>
          <Text className={styles.statLabel}>已评价</Text>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>设施类型</Text>
      </View>
      <View className={styles.facilityGrid}>
        {facilityTypes.map(facility => (
          <View
            key={facility.id}
            className={styles.facilityItem}
            onClick={() => handleFacilityClick(facility)}
          >
            <Text className={styles.facilityIcon}>{facility.icon}</Text>
            <Text className={styles.facilityName}>{facility.name}</Text>
          </View>
        ))}
      </View>

      {bannerAnnouncements.length > 0 && (
        <View className={styles.banner}>
          <Swiper
            className={styles.swiper}
            autoplay
            circular
            interval={3000}
            indicatorDots
            indicatorColor="rgba(255,255,255,0.5)"
            indicatorActiveColor="#ffffff"
          >
            {bannerAnnouncements.map(announcement => (
              <SwiperItem key={announcement.id}>
                <View
                  className={styles.slideItem}
                  onClick={() => handleAnnouncementClick(announcement.id)}
                >
                  <Image
                    src={announcement.coverImage || 'https://picsum.photos/id/1036/750/400'}
                    mode="aspectFill"
                  />
                  <View className={styles.slideOverlay}>
                    <Text className={styles.slideTitle}>{announcement.title}</Text>
                    <Text className={styles.slideTime}>{formatTime(announcement.publishTime)}</Text>
                  </View>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>最新公告</Text>
        <Text className={styles.moreText} onClick={handleViewMoreAnnouncements}>查看更多 →</Text>
      </View>
      {latestAnnouncements.length > 0 ? (
        latestAnnouncements.map(announcement => {
          const categoryInfo = categoryMap[announcement.category]
          return (
            <View
              key={announcement.id}
              className={styles.noticeCard}
              onClick={() => handleAnnouncementClick(announcement.id)}
            >
              <View className={styles.noticeHeader}>
                <View
                  className={styles.noticeTag}
                  style={{
                    background: `${categoryInfo?.color}15`,
                    color: categoryInfo?.color
                  }}
                >
                  {categoryInfo?.label}
                </View>
                <Text className={styles.noticeTitle}>{announcement.title}</Text>
                {announcement.isTop && <View className={styles.noticeTop}>置顶</View>}
              </View>
              <Text className={styles.noticeContent}>{announcement.content}</Text>
              <Text className={styles.noticeTime}>{formatTime(announcement.publishTime)}</Text>
            </View>
          )
        })
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无公告</Text>
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>我的工单</Text>
        <Text className={styles.moreText} onClick={handleViewMoreOrders}>查看更多 →</Text>
      </View>
      {myOrders.length > 0 ? (
        myOrders.map(order => (
          <View
            key={order.id}
            className={styles.noticeCard}
            onClick={() => handleOrderClick(order.id)}
          >
            <View className={styles.noticeHeader}>
              <View
                className={styles.noticeTag}
                style={{
                  background: order.status === 'pending' ? 'rgba(250,173,20,0.1)' :
                             order.status === 'processing' ? 'rgba(22,119,255,0.1)' :
                             order.status === 'completed' ? 'rgba(82,196,26,0.1)' :
                             'rgba(134,144,156,0.1)',
                  color: order.status === 'pending' ? '#faad14' :
                         order.status === 'processing' ? '#1677ff' :
                         order.status === 'completed' ? '#52c41a' :
                         '#86909c'
                }}
              >
                {order.status === 'pending' ? '待接单' :
                 order.status === 'processing' ? '处理中' :
                 order.status === 'completed' ? '已完成' : '已评价'}
              </View>
              <Text className={styles.noticeTitle}>{order.title}</Text>
            </View>
            <Text className={styles.noticeContent}>{order.description}</Text>
            <Text className={styles.noticeTime}>
              {order.facilityType.icon} {order.facilityType.name} · {formatTime(order.submitTime)}
            </Text>
          </View>
        ))
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyText}>暂无工单记录</Text>
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  )
}

export default HomePage
